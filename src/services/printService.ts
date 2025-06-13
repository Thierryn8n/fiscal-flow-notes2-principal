import { supabase } from '@/lib/supabase';

export interface PrintRequest {
  id: string;
  note_id: string;
  note_data: any;
  device_id: string | null;
  print_settings_id: string | null;
  copies: number | null;
  status: string;
  error_message: string | null;
  printed_at: string | undefined;
  created_by: string;
  created_at: string;
  updated_at: string | null;
}

interface PrintRequestRow extends Omit<PrintRequest, 'printed_at'> {
  printed_at: string | null;
}

/**
 * Serviço para gerenciar impressão remota
 */
export const PrintService = {
  /**
   * Envia uma solicitação para impressão em outro dispositivo
   */
  async sendPrintRequest(noteId: string, data: any, userId: string, copies: number = 1): Promise<{ success: boolean; error?: string }> {
    try {
      // Em vez de imprimir diretamente, vamos criar uma solicitação de impressão
      // que será processada pelo servidor
      const printRequest = {
        note_id: noteId,
        note_data: data,
        copies: copies,
        status: 'pending',
        created_by: userId
      };

      const { error } = await supabase
        .from('print_requests')
        .insert([printRequest]);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar solicitação de impressão:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar solicitação de impressão'
      };
    }
  },

  /**
   * Verifica as solicitações de impressão pendentes para o dispositivo atual
   */
  async getPendingPrintRequests(): Promise<PrintRequest[]> {
    // Obtém o ID do dispositivo local
    const deviceId = localStorage.getItem('device_id');
    if (!deviceId) return [];

    // Busca solicitações pendentes para este dispositivo
    const { data, error } = await supabase
      .from('print_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar solicitações de impressão:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Marca uma solicitação de impressão como impressa
   */
  async markAsPrinted(requestId: string): Promise<boolean> {
    const { error } = await supabase
      .from('print_requests')
      .update({
        status: 'printed',
        printed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) {
      console.error('Erro ao atualizar status da impressão:', error);
      return false;
    }

    return true;
  },

  /**
   * Marca uma solicitação de impressão como com erro
   */
  async markAsError(requestId: string, errorMessage: string): Promise<boolean> {
    const { error } = await supabase
      .from('print_requests')
      .update({
        status: 'error',
        error_message: errorMessage,
      })
      .eq('id', requestId);

    if (error) {
      console.error('Erro ao atualizar status da impressão:', error);
      return false;
    }

    return true;
  },

  /**
   * Configura uma assinatura para ouvir novas solicitações de impressão
   */
  subscribeToNewPrintRequests(callback: (request: PrintRequest) => void) {
    return supabase
      .channel('public:print_requests')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'print_requests',
          filter: `status=eq.pending` 
        },
        (payload) => {
          callback(payload.new as PrintRequest);
        }
      )
      .subscribe();
  },
  
  /**
   * Define um ID de usuário padrão para ser usado quando não houver usuário autenticado
   */
  setDefaultUserId(userId: string): void {
    localStorage.setItem('default_user_id', userId);
  },
  
  /**
   * Obtém o ID do usuário atual (autenticado ou padrão)
   */
  getCurrentUserId(): string {
    return localStorage.getItem('default_user_id') || 'guest_user';
  },

  async getPrintRequests(userId: string): Promise<PrintRequest[]> {
    const { data, error } = await supabase
      .from('print_requests')
      .select('*')
      .eq('created_by', userId);

    if (error) {
      throw error;
    }

    return (data as PrintRequestRow[]).map(request => ({
      id: request.id,
      note_id: request.note_id,
      note_data: request.note_data,
      device_id: request.device_id,
      print_settings_id: request.print_settings_id,
      copies: request.copies,
      status: request.status,
      error_message: request.error_message,
      printed_at: request.printed_at || undefined,
      created_by: request.created_by,
      created_at: request.created_at,
      updated_at: request.updated_at
    }));
  },

  async getPrintRequest(id: string): Promise<PrintRequest | null> {
    const { data, error } = await supabase
      .from('print_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data ? {
      id: data.id,
      note_id: data.note_id,
      note_data: data.note_data,
      device_id: data.device_id,
      print_settings_id: data.print_settings_id,
      copies: data.copies,
      status: data.status,
      error_message: data.error_message,
      printed_at: data.printed_at || undefined,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at
    } : null;
  },

  async createPrintRequest(request: Omit<PrintRequest, 'id' | 'created_at' | 'updated_at'>): Promise<PrintRequest> {
    const { data, error } = await supabase
      .from('print_requests')
      .insert([request])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      note_id: data.note_id,
      note_data: data.note_data,
      device_id: data.device_id,
      print_settings_id: data.print_settings_id,
      copies: data.copies,
      status: data.status,
      error_message: data.error_message,
      printed_at: data.printed_at || undefined,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  async updatePrintRequest(id: string, request: Partial<PrintRequest>): Promise<PrintRequest> {
    const { data, error } = await supabase
      .from('print_requests')
      .update(request)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      note_id: data.note_id,
      note_data: data.note_data,
      device_id: data.device_id,
      print_settings_id: data.print_settings_id,
      copies: data.copies,
      status: data.status,
      error_message: data.error_message,
      printed_at: data.printed_at || undefined,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  async deletePrintRequest(id: string): Promise<void> {
    const { error } = await supabase
      .from('print_requests')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}; 