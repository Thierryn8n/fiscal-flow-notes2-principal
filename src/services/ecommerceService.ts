import { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { supabasePublic, getPublicProducts, getPublicCategories, getPublicStoreSettings } from '@/integrations/supabase/publicClient';
import type { Database as SupabaseDatabase } from '@/types/supabase';
import { EcommerceProduct, CartItem, Category, StoreInfo, OrderKanban, DashboardOverviewData } from '@/types/ecommerce';

/**
 * IMPORTANTE: Páginas públicas como Ecommerce, Carrinho e Checkout NÃO requerem autenticação.
 * 
 * Para corrigir os erros 401 (Unauthorized) que estão ocorrendo com as tabelas do ecommerce,
 * é necessário configurar as políticas de segurança (RLS - Row Level Security) do Supabase.
 * 
 * Acesse o Supabase Dashboard em: https://app.supabase.com
 * Vá para: Database > Tables > (selecione a tabela) > Policies
 * 
 * Para cada tabela pública (products, ecommerce_categories, ecommerce_settings), adicione uma policy:
 * - Nome da policy: "Enable read access for all users"
 * - Operação: SELECT
 * - Target roles: authenticated, anon
 * - Using expression: true
 * 
 * Isso permitirá que usuários não autenticados acessem os dados dessas tabelas.
 */

// Tipos do Supabase
type Tables = Database['public']['Tables'];
type EcommerceProductRow = Tables['ecommerce_products']['Row'];
type OrderKanbanRow = Tables['orders_kanban']['Row'];
type CustomerRow = Tables['customers']['Row'];
type SellerRow = Tables['sellers']['Row'];
type Json = Database['public']['Tables']['fiscal_notes']['Row']['note_data'];

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

export class EcommerceService {
  private static readonly PRODUCTS_TABLE = 'ecommerce_products' as const;
  private static readonly CATEGORIES_TABLE = 'ecommerce_categories' as const;
  private static readonly SETTINGS_TABLE = 'ecommerce_settings' as const;
  private static readonly REVIEWS_TABLE = 'product_reviews' as const;
  private static readonly CART_STORAGE_KEY = 'fiscal_flow_cart';
  private static readonly STORE_INFO_STORAGE_KEY = 'fiscal_flow_store_info';
  private static readonly PRODUCTS_CACHE_KEY = 'fiscal_flow_products_cache';
  private static readonly PRODUCTS_TIMESTAMP_KEY = 'fiscal_flow_products_timestamp';
  private static readonly CACHE_EXPIRY = 5 * 60 * 1000;
  private static readonly SELLERS_TABLE = 'sellers' as const;
  private static readonly CUSTOMERS_TABLE = 'customers' as const;
  private static readonly ORDERS_TABLE = 'orders_kanban' as const;
  
  // Produtos
  static async getProducts(ownerId: string): Promise<EcommerceProduct[]> {
    const { data, error } = await supabase
      .from(this.PRODUCTS_TABLE)
      .select('*')
      .eq('owner_id', ownerId);

    if (error) throw error;
    if (!data) return [];

    return data.map(product => ({
      id: product.id,
      name: product.name,
      code: product.code,
      description: product.description,
      price: product.price,
      image_path: product.image_path,
      ncm: product.ncm,
      unit: product.unit,
      quantity: product.quantity,
      total_amount: product.total_amount,
      category_id: product.category_id,
      owner_id: product.owner_id,
      created_at: product.created_at,
      updated_at: product.updated_at
    }));
  }
  
  static async getProduct(id: string): Promise<EcommerceProduct> {
    const { data, error } = await supabase
      .from(this.PRODUCTS_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Produto não encontrado');

    return {
      id: data.id,
      name: data.name,
      code: data.code,
      description: data.description,
      price: data.price,
      image_path: data.image_path,
      ncm: data.ncm,
      unit: data.unit,
      quantity: data.quantity,
      total_amount: data.total_amount,
      category_id: data.category_id,
      owner_id: data.owner_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }
  
  // Cache para categorias
  private static categoriesCache: Category[] | null = null;
  private static categoriesCacheTimestamp: number = 0;

  // Obter categorias com cache
  static async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from(this.CATEGORIES_TABLE)
        .select('*');

      if (error) throw error;

      return (data || []).map(mapSupabaseCategory);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }
  
  static async createCategory(category: { name: string; description?: string; icon?: string }): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from(this.CATEGORIES_TABLE)
        .insert([
          {
        name: category.name,
        description: category.description,
            icon: category.icon || 'Package2'
          }
        ])
        .select()
        .single();
      
      if (error) throw error;

      return data ? {
        ...data,
        created_at: data.created_at,
        updated_at: data.updated_at
      } : null;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  }

  static async updateCategory(id: string, categoryUpdate: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from(this.CATEGORIES_TABLE)
        .update({
          name: categoryUpdate.name,
          description: categoryUpdate.description,
          icon: categoryUpdate.icon
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      return data ? {
        ...data,
        created_at: data.created_at,
        updated_at: data.updated_at
      } : null;
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  }

  static async deleteCategory(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.CATEGORIES_TABLE)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Invalida o cache
      this.categoriesCache = null;
      this.categoriesCacheTimestamp = 0;
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      return false;
    }
  }
  
  static async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.PRODUCTS_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
  
  // Carrinho de compras
  static getCart(): CartItem[] {
    try {
      const cartData = localStorage.getItem(this.CART_STORAGE_KEY);
      if (cartData) {
        return JSON.parse(cartData);
      }
      return [];
    } catch (error) {
      console.error('Erro ao obter carrinho:', error);
      return [];
    }
  }
  
  static saveCart(cart: CartItem[]): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
    }
  }
  
  static async addToCart(cart: CartItem[], product: EcommerceProduct, quantity: number = 1): Promise<CartItem[]> {
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity += quantity;
      cart[existingItemIndex].subtotal = cart[existingItemIndex].price * cart[existingItemIndex].quantity;
      return [...cart];
    }

    const newItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      unit: product.unit,
      subtotal: product.price * quantity,
    };

    return [...cart, newItem];
  }
  
  static updateCartItemQuantity(itemId: string, quantity: number): CartItem[] {
    try {
      const cart = this.getCart();
      
      const updatedCart = cart.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, quantity); // Mínimo 1
          return {
            ...item,
            quantity: newQuantity,
            subtotal: item.price * newQuantity
          };
        }
        return item;
      });
      
      this.saveCart(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Erro ao atualizar quantidade no carrinho:', error);
      return this.getCart();
    }
  }
  
  static removeFromCart(itemId: string): CartItem[] {
    try {
      let cart = this.getCart();
      cart = cart.filter(item => item.id !== itemId);
      this.saveCart(cart);
      return cart;
    } catch (error) {
      console.error('Erro ao remover item do carrinho:', error);
      return this.getCart();
    }
  }
  
  static clearCart(): void {
    localStorage.removeItem(this.CART_STORAGE_KEY);
  }
  
  static calculateCartTotal(cart: CartItem[]): number {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
  
  // Cache para informações da loja
  private static storeInfoCache: StoreInfo | null = null;
  private static storeInfoCacheTimestamp: number = 0;

  // Obter informações da loja com cache
  static async getStoreInfo(forceRefresh: boolean = false, ownerId?: string): Promise<StoreInfo> {
    const { data, error } = await supabase
      .from('ecommerce_settings')
      .select('*')
      .eq('owner_id', ownerId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Configurações da loja não encontradas');

    return {
      name: data.store_name || '',
      description: data.store_description,
      logo_url: data.logo_url,
      banner_url: data.banner_url,
      theme: {
        primary_color: data.primary_color || '#000000',
        secondary_color: data.secondary_color || '#ffffff',
        background_color: data.background_color || '#f5f5f5',
      },
      contact: {
        phone: data.contact_phone || '',
        email: data.contact_email || '',
        address: data.contact_address || '',
      },
    };
  }
  
  // Funções auxiliares
  private static generateSlug(name: string): string {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/[^\w-]+/g, ''); // Remove caracteres não alfanuméricos exceto hífens
  }

  // Funções para Product Reviews
  static async getProductReviews(productId: string): Promise<ProductReview[]> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId);

      if (error) throw error;
      return (data || []).map(mapSupabaseReview);
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return [];
    }
  }

  static async addProductReview(review: Omit<ProductReview, 'id' | 'created_at' | 'updated_at'>): Promise<ProductReview | null> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .insert(review)
        .select()
        .single();

      if (error) throw error;
      return data ? mapSupabaseReview(data) : null;
    } catch (error) {
      console.error('Error adding product review:', error);
      return null;
    }
  }

  /**
   * Obtém os estilos de cartão de produto da tabela ecommerce_product_card_styles
   */
  static async getProductCardStyles(): Promise<any> {
    try {
      // Primeiro tentamos usar o cliente público
      const { data, error } = await supabase
        .from('ecommerce_product_card_styles')
        .select('*')
        .limit(1)
        .single();
      
      if (error) {
        console.error('Erro ao buscar estilos de cartão:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar estilos de cartão:', error);
      return null;
    }
  }

  // Buscar vendedores ativos
  static async getActiveSellers(ownerId: string): Promise<Seller[]> {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('active', true)
        .order('full_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar vendedores:', error);
      return [];
    }
  }

  // Criar novo cliente (sem autenticação)
  static async createCustomer(customerData: NewCustomerData): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        throw error;
    }
  }

  // Criar pedido no Kanban (sem autenticação)
  static async createOrderKanban(orderData: NewOrderKanbanData): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('orders_kanban')
        .insert([{
          ...orderData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Erro ao criar pedido no Kanban:', error);
      throw error;
    }
  }

  static async getOrders(ownerId: string): Promise<OrderKanban[]> {
    const { data, error } = await supabase
      .from(this.ORDERS_TABLE)
      .select('*')
      .eq('owner_id', ownerId);

    if (error) {
      throw error;
    }

    return (data as OrderKanbanRow[]).map(order => ({
      id: order.id,
      customer_id: order.customer_id,
      customer_name: order.customer_name,
      product_id: order.product_id,
      product_name: order.product_name,
      seller_id: order.seller_id,
      seller_name: order.seller_name,
      status: order.status,
      notes: order.notes || undefined,
      total_amount: order.total_amount || undefined,
      owner_id: order.owner_id,
      created_at: order.created_at || undefined,
      updated_at: order.updated_at || undefined
    }));
  }

  static async getDashboardOverview(ownerId: string): Promise<DashboardOverviewData> {
    const { data: orders, error } = await supabase
      .from(this.ORDERS_TABLE)
      .select('*')
      .eq('owner_id', ownerId);

    if (error) throw error;
    if (!orders) return {
      total_sales: 0,
      total_orders: 0,
      average_order_value: 0,
      recent_orders: []
    };

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const recentOrders = orders
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5);

    return {
      total_sales: totalRevenue,
      total_orders: totalOrders,
      average_order_value: averageOrderValue,
      recent_orders: recentOrders
    };
  }
} 