import { Json } from './supabase';

// Interface para o endereço do cliente
export interface CustomerAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

// Interface para dados do formulário de cliente
export interface CustomerFormData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: CustomerAddress;
  owner_id?: string;
}

// Interface para dados do cliente no banco
export interface CustomerDB {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: Json;
  signature: string | null;
  owner_id: string;
  created_at: string | null;
  updated_at: string | null;
}

// Interface principal para clientes
export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: CustomerAddress | null;
  signature: string | null;
  owner_id: string;
  created_at: string | null;
  updated_at: string | null;
}

// Interface para filtros de busca de clientes
export interface CustomerFilters {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

// Interface para resposta paginada
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Funções auxiliares para conversão de tipos
export function mapDBToCustomer(dbCustomer: CustomerDB): Customer {
  return {
    ...dbCustomer,
    address: dbCustomer.address ? (dbCustomer.address as unknown as CustomerAddress) : null
  };
}

export function mapFormToDB(formData: Omit<CustomerFormData, 'id'>, owner_id: string): Omit<CustomerDB, 'id' | 'created_at' | 'updated_at'> {
  return {
    ...formData,
    email: formData.email || null,
    signature: null,
    owner_id,
    address: formData.address as unknown as Json
  };
}

export function mapCustomerToForm(customer: Customer): CustomerFormData {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email || '',
    phone: customer.phone,
    address: customer.address || {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
    },
    owner_id: customer.owner_id
  };
} 