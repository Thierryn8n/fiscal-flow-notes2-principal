import { supabase } from '@/lib/supabase';

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  owner_id: string;
  created_at: string;
  updated_at: string | null;
}

export const SellersService = {
  async getSellers(): Promise<Seller[]> {
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  },

  async getSeller(id: string): Promise<Seller | null> {
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  },

  async createSeller(seller: Omit<Seller, 'id' | 'created_at' | 'updated_at'>): Promise<Seller> {
    const { data, error } = await supabase
      .from('sellers')
      .insert([seller])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async updateSeller(id: string, seller: Partial<Seller>): Promise<Seller> {
    const { data, error } = await supabase
      .from('sellers')
      .update(seller)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async deleteSeller(id: string): Promise<void> {
    const { error } = await supabase
      .from('sellers')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}; 