import { supabase } from '@/lib/supabaseClient';

export type NoteStatus = 'draft' | 'finalized' | 'printed' | 'paid' | 'cancelled';

export interface FiscalNote {
  id: string;
  ownerId: string;
  customerId: string;
  number: number;
  series: string;
  status: NoteStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  printedAt?: string;
  paidAt?: string;
  dueDate?: string;
  paymentMethod?: string;
  notes?: string;
}

interface DatabaseFiscalNote {
  id: string;
  owner_id: string;
  customer_id: string;
  number: number;
  series: string;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
  printed_at?: string;
  paid_at?: string;
  due_date?: string;
  payment_method?: string;
  notes?: string;
}

export class NotesService {
  private static readonly TABLE_NAME = 'fiscal_notes' as const;

  private static toCamelCase(data: DatabaseFiscalNote): FiscalNote {
    return {
      id: data.id,
      ownerId: data.owner_id,
      customerId: data.customer_id,
      number: data.number,
      series: data.series,
      status: data.status as NoteStatus,
      total: data.total,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      printedAt: data.printed_at,
      paidAt: data.paid_at,
      dueDate: data.due_date,
      paymentMethod: data.payment_method,
      notes: data.notes
    };
  }

  static async saveNote(note: FiscalNote): Promise<FiscalNote | null> {
    try {
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
        .upsert({
          id: note.id,
          owner_id: note.ownerId,
          customer_id: note.customerId,
          number: note.number,
          series: note.series,
          status: note.status,
          total: note.total,
          printed_at: note.printedAt,
          paid_at: note.paidAt,
          due_date: note.dueDate,
          payment_method: note.paymentMethod,
          notes: note.notes
        })
        .select()
          .single();

      if (error) throw error;
        return data ? this.toCamelCase(data) : null;
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      throw error;
    }
  }

  static async getNotes(userId: string, page = 1, pageSize = 10) {
    try {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

    const { data, error, count } = await supabase
      .from(this.TABLE_NAME)
      .select('*', { count: 'exact' })
        .eq('owner_id', userId)
        .range(start, end)
        .order('created_at', { ascending: false });

    if (error) throw error;

      return {
        notes: data.map(this.toCamelCase),
        total: count || 0
      };
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      throw error;
    }
  }

  static async getNoteById(id: string, ownerId: string): Promise<FiscalNote | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .eq('owner_id', ownerId)
        .single();

      if (error) throw error;
      return data ? this.toCamelCase(data) : null;
    } catch (error) {
      console.error('Erro ao buscar nota:', error);
      throw error;
    }
  }

  static async updateNoteStatus(
    id: string,
    ownerId: string,
    status: NoteStatus
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({ status })
        .eq('id', id)
        .eq('owner_id', ownerId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status da nota:', error);
      throw error;
    }
  }

  static async deleteNote(id: string, ownerId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id)
        .eq('owner_id', ownerId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
      throw error;
    }
  }
  
  static async markAsPrinted(id: string, ownerId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({ printed_at: new Date().toISOString() })
        .eq('id', id)
        .eq('owner_id', ownerId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao marcar nota como impressa:', error);
      throw error;
    }
  }

  static async markAsPaid(id: string, ownerId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({ paid_at: new Date().toISOString() })
        .eq('id', id)
        .eq('owner_id', ownerId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao marcar nota como paga:', error);
      throw error;
    }
  }

  static async getNote(id: string): Promise<FiscalNote | null> {
    try {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
      return data ? this.toCamelCase(data) : null;
    } catch (error) {
      console.error('Erro ao buscar nota:', error);
      throw error;
    }
  }

  static async createNote(note: Omit<FiscalNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<FiscalNote> {
    try {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert({
          owner_id: note.ownerId,
          customer_id: note.customerId,
          number: note.number,
          series: note.series,
        status: note.status,
          total: note.total,
          printed_at: note.printedAt,
          paid_at: note.paidAt,
          due_date: note.dueDate,
          payment_method: note.paymentMethod,
          notes: note.notes
      })
      .select()
      .single();

    if (error) throw error;
      if (!data) throw new Error('Nota não foi criada');

      return this.toCamelCase(data);
    } catch (error) {
      console.error('Erro ao criar nota:', error);
      throw error;
    }
  }

  static async updateNote(id: string, note: Partial<Omit<FiscalNote, 'id' | 'createdAt' | 'updatedAt'>>): Promise<FiscalNote> {
    try {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
        .update({
          customer_id: note.customerId,
          number: note.number,
          series: note.series,
          status: note.status,
          total: note.total,
          printed_at: note.printedAt,
          paid_at: note.paidAt,
          due_date: note.dueDate,
          payment_method: note.paymentMethod,
          notes: note.notes
        })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
      if (!data) throw new Error('Nota não foi atualizada');

      return this.toCamelCase(data);
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      throw error;
    }
  }
}