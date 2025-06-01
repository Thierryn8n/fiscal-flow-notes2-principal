import { Database } from './supabase';

// Tipos do Supabase
type Tables = Database['public']['Tables'];
type EcommerceProductRow = Tables['ecommerce_products']['Row'];
type OrderKanbanRow = Tables['orders_kanban']['Row'];
type CustomerRow = Tables['customers']['Row'];
type SellerRow = Tables['sellers']['Row'];

// Tipos locais
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface EcommerceProduct extends Omit<EcommerceProductRow, 'created_at' | 'updated_at'> {
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit?: string;
  total_amount: number;
}

export interface StoreInfo {
  name: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  theme: {
    primary_color: string;
    secondary_color: string;
    background_color: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
  };
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at?: string;
}

export interface Seller extends Omit<SellerRow, 'active' | 'auth_user_id'> {
  active?: boolean | null;
  auth_user_id?: string | null;
}

export interface Customer extends Omit<CustomerRow, 'address'> {
  address?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  } | null;
}

export interface OrderKanban extends Omit<OrderKanbanRow, 'created_at' | 'updated_at'> {
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DashboardOverviewData {
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  recent_orders: OrderKanban[];
} 