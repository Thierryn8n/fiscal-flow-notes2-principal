import { Customer, CustomerFormData, CustomerDB } from '@/types/Customer';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import { executeWithTokenRefresh, isJwtExpiredError } from '@/utils/auth-helpers';
import { Json } from '@/types/supabase';

/* 
 * Serviço de Clientes - Parte do sistema Fiscal Flow
 * Visual de grade (grid lines) aplicado nas páginas para melhor organização visual
 */

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  pageInfo: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Função para mapear os dados do banco para o tipo Customer
function mapDBToCustomer(dbCustomer: CustomerDB): Customer {
  return {
    ...dbCustomer,
    address: dbCustomer.address as unknown as Customer['address']
  };
}

// Função para mapear os dados do formulário para o tipo do banco
function mapFormToDB(formData: Omit<CustomerFormData, 'id'>, owner_id: string): Omit<CustomerDB, 'id' | 'created_at' | 'updated_at'> {
  return {
    ...formData,
    email: formData.email || null,
    signature: null,
    owner_id,
    address: formData.address as unknown as Json
  };
}

export const CustomersService = {
  CUSTOMERS_TABLE: 'customers',

  async getCustomers(page: number = 1, pageSize: number = 10, searchTerm: string = ''): Promise<{ customers: Customer[], count: number }> {
    try {
      let query = supabase
        .from(this.CUSTOMERS_TABLE)
        .select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,address->city.ilike.%${searchTerm}%`);
      }

      const { data: customersData, count, error } = await query
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapear os dados do cliente para garantir a tipagem correta
      const customers = (customersData as CustomerDB[])?.map(mapDBToCustomer);

      return {
        customers,
        count: count || 0
      };
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  },

  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from(this.CUSTOMERS_TABLE)
        .select('*')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) {
        if (isJwtExpiredError(error)) {
          return await executeWithTokenRefresh(() => this.searchCustomers(searchTerm)) || [];
        }
        throw error;
      }

      return (data || []).map(mapDBToCustomer);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  },

  async saveCustomer(customerData: CustomerFormData): Promise<Customer> {
    try {
      const { id, owner_id, ...customerWithoutId } = customerData;
      
      // Preparar dados para salvar no banco
      const customerToSave = mapFormToDB(customerWithoutId, owner_id || '');

      if (id) {
        // Atualizar cliente existente
        const { data, error } = await supabase
          .from(this.CUSTOMERS_TABLE)
          .update(customerToSave)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return mapDBToCustomer(data as CustomerDB);
      } else {
        // Criar novo cliente
        const { data, error } = await supabase
          .from(this.CUSTOMERS_TABLE)
          .insert([customerToSave])
          .select()
          .single();

        if (error) throw error;
        return mapDBToCustomer(data as CustomerDB);
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      throw error;
    }
  },

  async findOrCreateCustomer(customerData: Partial<Customer>): Promise<Customer> {
    try {
      // Primeiro tenta encontrar o cliente
      const { data: existingCustomers, error: searchError } = await supabase
        .from(this.CUSTOMERS_TABLE)
        .select('*')
        .eq('phone', customerData.phone)
        .limit(1);

      if (searchError) {
        if (isJwtExpiredError(searchError)) {
          const result = await executeWithTokenRefresh(() => this.findOrCreateCustomer(customerData));
          if (!result) throw new Error('Falha ao buscar/criar cliente após renovação do token');
          return result;
        }
        throw searchError;
      }

      // Se encontrou, retorna o primeiro
      if (existingCustomers && existingCustomers.length > 0) {
        return mapDBToCustomer(existingCustomers[0]);
      }

      // Se não encontrou, cria um novo
      const { data: newCustomer, error: createError } = await supabase
        .from(this.CUSTOMERS_TABLE)
        .insert([customerData])
        .select()
        .single();

      if (createError) {
        if (isJwtExpiredError(createError)) {
          const result = await executeWithTokenRefresh(() => this.findOrCreateCustomer(customerData));
          if (!result) throw new Error('Falha ao criar cliente após renovação do token');
          return result;
        }
        throw createError;
      }

      if (!newCustomer) throw new Error('Nenhum dado retornado ao criar cliente');
      return mapDBToCustomer(newCustomer);
    } catch (error) {
      console.error('Erro ao buscar/criar cliente:', error);
      throw error;
    }
  },

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from(this.CUSTOMERS_TABLE)
        .update(customer)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (isJwtExpiredError(error)) {
          const result = await executeWithTokenRefresh(() => this.updateCustomer(id, customer));
          if (!result) throw new Error('Falha ao atualizar cliente após renovação do token');
          return result;
        }
        throw error;
      }

      if (!data) throw new Error('Nenhum dado retornado ao atualizar cliente');
      return mapDBToCustomer(data as CustomerDB);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  },

  async deleteCustomer(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.CUSTOMERS_TABLE)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      throw error;
    }
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from(this.CUSTOMERS_TABLE)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return mapDBToCustomer(data as CustomerDB);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }
  }
} 