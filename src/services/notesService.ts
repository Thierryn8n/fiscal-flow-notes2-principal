import { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabase';

// Tipos do Supabase
type Tables = Database['public']['Tables'];
type NoteRow = Tables['fiscal_notes']['Row'];
type NoteInsert = Tables['fiscal_notes']['Insert'];
type NoteUpdate = Tables['fiscal_notes']['Update'];
type Json = Database['public']['Tables']['fiscal_notes']['Row']['note_data'];

// Tipos locais
export type NoteStatus = 'draft' | 'pending' | 'finalized' | 'cancelled' | 'printed';

export interface CustomerAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface CustomerData {
  name: string;
  email?: string;
  phone?: string;
  address: CustomerAddress;
}

export interface NoteProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  unit: string;
  ncm: string;
}

export interface PaymentData {
  method: 'money' | 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer';
  installments?: number;
  status: 'pending' | 'paid' | 'cancelled';
  paid_at?: string;
  total_paid?: number;
}

// Interface principal da nota fiscal
export interface FiscalNote {
  id: string;
  note_number: string;
  note_data: {
    customer: CustomerData;
    products: NoteProduct[];
  };
  payment_data: PaymentData;
  total_value: number;
  status: NoteStatus;
  owner_id: string;
  printed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Interface para filtros de busca
export interface NoteFilters {
  startDate?: string;
  endDate?: string;
  status?: NoteStatus;
  noteNumber?: string;
  customerName?: string;
}

export class NotesService {
  private static readonly TABLE_NAME = 'fiscal_notes' as const;

  /**
   * Converte uma FiscalNote de camelCase para snake_case
   */
  private static toSnakeCase(note: FiscalNote): NoteInsert {
    return {
      id: note.id,
      note_number: note.note_number,
      note_data: note.note_data as unknown as Json,
      payment_data: note.payment_data as unknown as Json,
      total_value: note.total_value,
      status: note.status,
      owner_id: note.owner_id,
      printed_at: note.printed_at || null,
      created_at: note.created_at || null,
      updated_at: note.updated_at || null
    };
  }

  /**
   * Converte um objeto do banco de dados para FiscalNote (snake_case para camelCase)
   */
  private static toCamelCase(data: NoteRow): FiscalNote {
    return {
      id: data.id,
      note_number: data.note_number,
      note_data: data.note_data as unknown as { customer: CustomerData; products: NoteProduct[] },
      payment_data: data.payment_data as unknown as PaymentData,
      total_value: data.total_value,
      status: data.status as NoteStatus,
      owner_id: data.owner_id,
      printed_at: data.printed_at,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  /**
   * Salva uma nova nota fiscal ou atualiza uma existente
   */
  static async saveNote(note: FiscalNote): Promise<FiscalNote | null> {
    try {
      if (note.id) {
        const noteData = this.toSnakeCase(note);
        console.log('Atualizando nota existente:', noteData);
        
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
          .update({
            ...noteData,
            updated_at: new Date().toISOString()
          })
          .eq('id', note.id)
          .eq('owner_id', note.owner_id)
          .select('*')
          .single();

        if (error) {
          console.error('Erro na atualização:', error);
          throw error;
        }
        
        return data ? this.toCamelCase(data) : null;
      } else {
        const noteData = this.toSnakeCase(note);
        console.log('Inserindo nova nota:', noteData);
        
        delete noteData.id;
        
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
          .insert({
            ...noteData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('*')
          .single();

        if (error) {
          console.error('Erro na inserção:', error.message, error.details, error);
          throw error;
        }
        
        return data ? this.toCamelCase(data) : null;
      }
    } catch (error) {
      console.error('Erro ao salvar nota fiscal:', error);
      throw error;
    }
  }

  /**
   * Busca todas as notas fiscais com base nos filtros
   */
  static async getNotes(
    ownerId: string,
    filters?: NoteFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: FiscalNote[]; count: number }> {
    const { data, error, count } = await supabase
      .from(this.TABLE_NAME)
      .select('*', { count: 'exact' })
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    if (!data) return { data: [], count: 0 };

    return { data: data as FiscalNote[], count: count || 0 };
  }

  /**
   * Busca uma nota fiscal específica pelo ID
   */
  static async getNoteById(id: string, ownerId: string): Promise<FiscalNote | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .eq('owner_id', ownerId)
        .single();

      if (error) throw error;
      return data as FiscalNote | null;
    } catch (error) {
      console.error('Erro ao buscar nota fiscal por ID:', error);
      return null;
    }
  }

  /**
   * Atualiza o status de uma nota fiscal
   */
  static async updateNoteStatus(
    id: string,
    status: NoteStatus,
    ownerId: string
  ): Promise<boolean> {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };

      // Se for marcado como impresso, atualizar também a data de impressão
      if (status === 'printed') {
        updates.printed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update(updates)
        .eq('id', id)
        .eq('owner_id', ownerId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status da nota fiscal:', error);
      return false;
    }
  }

  /**
   * Exclui uma nota fiscal (apenas se for rascunho)
   */
  static async deleteNote(id: string, ownerId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id)
        .eq('owner_id', ownerId);

      return !error;
    } catch (error) {
      console.error('Erro ao deletar nota:', error);
      return false;
    }
  }
  
  /**
   * Marca uma nota como impressa
   */
  static async markAsPrinted(id: string, ownerId: string): Promise<boolean> {
    return this.updateNoteStatus(id, 'printed', ownerId);
  }

  /**
   * Marca uma nota fiscal como paga
   */
  static async markAsPaid(id: string, ownerId: string): Promise<boolean> {
    try {
      const { data: currentNote, error: fetchError } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .eq('owner_id', ownerId)
        .single();

      if (fetchError || !currentNote) {
        throw new Error('Nota não encontrada');
      }

      const paymentData = {
        ...(currentNote.payment_data as PaymentData),
        paid: true,
        paidAt: new Date().toISOString()
      };

      const updates: NoteUpdate = {
        payment_data: paymentData as Json,
        status: currentNote.status !== 'finalized' ? 'finalized' : currentNote.status,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update(updates)
        .eq('id', id)
        .eq('owner_id', ownerId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao marcar nota como paga:', error);
      return false;
    }
  }

  static async getNote(id: string): Promise<FiscalNote | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as FiscalNote | null;
  }

  static async createNote(note: Omit<FiscalNote, 'id' | 'created_at' | 'updated_at'>): Promise<FiscalNote> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert({
        note_number: note.note_number,
        note_data: {
          customer: note.note_data.customer,
          products: note.note_data.products
        } as unknown as Json,
        payment_data: {
          method: note.payment_data.method,
          installments: note.payment_data.installments,
          status: note.payment_data.status,
          paid_at: note.payment_data.paid_at,
          total_paid: note.payment_data.total_paid
        } as unknown as Json,
        total_value: note.total_value,
        status: note.status,
        owner_id: note.owner_id,
        printed_at: note.printed_at
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Erro ao criar nota fiscal');

    return data as FiscalNote;
  }

  static async updateNote(id: string, note: Partial<Omit<FiscalNote, 'id' | 'created_at' | 'updated_at'>>): Promise<FiscalNote> {
    const updateData: NoteUpdate = {};

    if (note.note_number) updateData.note_number = note.note_number;
    if (note.note_data) {
      updateData.note_data = {
        customer: note.note_data.customer,
        products: note.note_data.products
      } as unknown as Json;
    }
    if (note.payment_data) {
      updateData.payment_data = {
        method: note.payment_data.method,
        installments: note.payment_data.installments,
        status: note.payment_data.status,
        paid_at: note.payment_data.paid_at,
        total_paid: note.payment_data.total_paid
      } as unknown as Json;
    }
    if (note.total_value) updateData.total_value = note.total_value;
    if (note.status) updateData.status = note.status;
    if (note.owner_id) updateData.owner_id = note.owner_id;
    if (note.printed_at) updateData.printed_at = note.printed_at;

    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Erro ao atualizar nota fiscal');

    return data as FiscalNote;
  }
}