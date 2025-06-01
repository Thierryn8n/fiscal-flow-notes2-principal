import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase';

type Tables = Database['public']['Tables'];
type CustomerRow = Tables['customers']['Row'];
type CustomerAddress = Database['public']['Tables']['customers']['Row']['address'];

/* 
 * Serviço de Clientes - Parte do sistema Fiscal Flow
 * Visual de grade (grid lines) aplicado nas páginas para melhor organização visual
 */
export interface ICustomerAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
}

export interface ICustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: ICustomerAddress | null;
  signature: string | null;
  owner_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface CustomerFilters {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  pageInfo: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

const mapCustomerAddress = (address: CustomerAddress): ICustomerAddress | null => {
  if (!address || typeof address !== 'object') return null;
  
  const typedAddress = address as Record<string, string>;
  return {
    street: typedAddress.street || '',
    number: typedAddress.number || '',
    complement: typedAddress.complement,
    neighborhood: typedAddress.neighborhood || '',
    city: typedAddress.city || '',
    state: typedAddress.state || '',
    zipcode: typedAddress.zipcode || ''
  };
};

const mapCustomerFromSupabase = (data: CustomerRow): ICustomer => ({
  id: data.id,
  name: data.name,
  phone: data.phone,
  email: data.email,
  address: mapCustomerAddress(data.address),
  signature: data.signature,
  owner_id: data.owner_id,
  created_at: data.created_at,
  updated_at: data.updated_at
});

export class CustomersService {
  private static readonly CUSTOMERS_TABLE = 'customers';

  static async getCustomers(ownerId: string, filters?: CustomerFilters): Promise<ICustomer[]> {
    let query = supabase
      .from(this.CUSTOMERS_TABLE)
      .select('*')
      .eq('owner_id', ownerId);

    if (filters?.searchTerm) {
      query = query.or(`name.ilike.%${filters.searchTerm}%,phone.ilike.%${filters.searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data as CustomerRow[]).map(mapCustomerFromSupabase);
  }

  static async getCustomer(id: string): Promise<ICustomer | null> {
    const { data, error } = await supabase
      .from(this.CUSTOMERS_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data ? mapCustomerFromSupabase(data) : null;
  }

  static async createCustomer(customerData: Omit<ICustomer, 'id' | 'created_at' | 'updated_at'>): Promise<ICustomer> {
    const supabaseData = {
      name: customerData.name,
      phone: customerData.phone,
      email: customerData.email,
      address: customerData.address as CustomerAddress,
      signature: customerData.signature,
      owner_id: customerData.owner_id
    };

    const { data, error } = await supabase
      .from(this.CUSTOMERS_TABLE)
      .insert([supabaseData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapCustomerFromSupabase(data);
  }

  static async updateCustomer(id: string, customerData: Partial<ICustomer>): Promise<ICustomer> {
    const supabaseData = {
      ...(customerData.name && { name: customerData.name }),
      ...(customerData.phone && { phone: customerData.phone }),
      ...(customerData.email !== undefined && { email: customerData.email }),
      ...(customerData.address !== undefined && { address: customerData.address as CustomerAddress }),
      ...(customerData.signature !== undefined && { signature: customerData.signature })
    };

    const { data, error } = await supabase
      .from(this.CUSTOMERS_TABLE)
      .update(supabaseData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapCustomerFromSupabase(data);
  }

  static async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.CUSTOMERS_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
} 