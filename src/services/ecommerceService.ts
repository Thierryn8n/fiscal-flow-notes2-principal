import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { supabasePublic, getPublicProducts, getPublicCategories, getPublicStoreSettings } from '@/integrations/supabase/publicClient';
import type { Database } from '@/types/supabase';
import { Database as SupabaseDatabase } from '@/types/supabase';

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

type Tables = Database['public']['Tables'];
type EcommerceProductRow = Tables['ecommerce_products']['Row'];
type OrderKanbanRow = Tables['orders_kanban']['Row'];
type CustomerRow = Tables['customers']['Row'];
type SellerRow = Tables['sellers']['Row'];

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface EcommerceProduct extends Omit<EcommerceProductRow, 'created_at' | 'updated_at'> {
  created_at?: string;
  updated_at?: string;
}

export interface Category extends Omit<Tables['ecommerce_categories']['Row'], 'created_at' | 'updated_at'> {
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  unit?: string;
  subtotal: number;
}

export interface StoreInfo {
  name: string;
  store_name?: string;
  logo?: string;
  logo_url?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  banner_image_url?: string;
  use_overlay_text?: boolean;
  font_family?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  header_background_color?: string;
  footer_background_color?: string;
  button_style?: string;
  border_radius?: number;
  favicon_url?: string;
  product_cards_per_row?: number;
  show_product_ratings?: boolean;
  show_discount_badge?: boolean;
  display_product_quick_view?: boolean;
  enable_wishlist?: boolean;
  show_social_share_buttons?: boolean;
  meta_keywords?: string;
  paymentMethods?: string[];
  shippingMethods?: {
    id: string;
    name: string;
    price: number;
    description?: string;
  }[];
  footer_social_facebook?: string;
  footer_social_instagram?: string;
  footer_social_twitter?: string;
  footer_social_linkedin?: string;
  footer_social_youtube?: string;
  cachedAt?: string;
}

// Interface para Avaliações de Produto
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

// Interface para Vendedores
export interface Seller extends Omit<SellerRow, 'active' | 'auth_user_id'> {
  active?: boolean | null;
  auth_user_id?: string | null;
}

// Interface para Clientes (baseado na migração 20230603000000_create_customers_table.sql)
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

export interface NewCustomerData {
  name: string;
  phone: string;
  email?: string;
  address: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string; // CEP
  };
  owner_id: string; // ID do proprietário da loja/contexto
}

// Interfaces para o sistema Kanban
export interface OrderKanban {
  id: string;
  customer_id: string;
  customer_name: string;
  product_id: string;
  product_name: string;
  seller_id: string;
  seller_name: string;
  status: OrderStatus;
  notes?: string;
  total_amount?: number;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface NewOrderKanbanData {
  product_id: string;
  product_name: string;
  customer_id: string;
  customer_name: string;
  seller_id: string;
  seller_name: string;
  status: OrderStatus;
  notes?: string;
  total_amount?: number;
}

// Nova interface para os dados da Visão Geral do Dashboard
export interface DashboardOverviewData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: {
    name: string;
    revenue: number;
    orders: number;
  }[];
  recentOrders: {
    id: string;
    customer_name: string;
    created_at?: string;
    status: OrderStatus;
    product_name: string;
    total_amount?: number;
  }[];
  salesByStatus: {
    [key in OrderStatus]: {
      count: number;
      revenue: number;
    };
  };
}

type PublicProductsReturnType = Awaited<ReturnType<typeof getPublicProducts>>;
type PublicCategoriesReturnType = Awaited<ReturnType<typeof getPublicCategories>>;
type PublicStoreSettingsReturnType = Awaited<ReturnType<typeof getPublicStoreSettings>>;

type EcommerceCategoriesTableRow = Database['public']['Tables']['ecommerce_categories']['Row'];
type EcommerceSettingsTableRow = Database['public']['Tables']['ecommerce_settings']['Row'];

const mapSupabaseProduct = (data: any): EcommerceProduct => ({
  id: data.id,
  name: data.name,
  code: data.code,
  description: data.description || '',
  price: data.price,
  image_path: data.image_path,
  ncm: data.ncm || '',
  unit: data.unit || '',
  quantity: data.quantity || 0,
  total_amount: data.total_amount,
  category_id: data.category_id,
  owner_id: data.owner_id,
  created_at: data.created_at,
  updated_at: data.updated_at
});

const mapSupabaseCategory = (data: any): Category => ({
  id: data.id,
  name: data.name,
  description: data.description || undefined,
  icon: data.icon || undefined,
  createdAt: data.created_at || undefined,
  updatedAt: data.updated_at || undefined
});

const mapSupabaseReview = (data: any): ProductReview => ({
  id: data.id,
  product_id: data.product_id,
  user_id: data.user_id,
  author_name: data.author_name,
  rating: data.rating,
  comment: data.comment,
  created_at: data.created_at,
  updated_at: data.updated_at || undefined
});

const mapSupabaseOrder = (data: any): OrderKanban => ({
  id: data.id,
  customer_id: data.customer_id,
  customer_name: data.customer_name,
  product_id: data.product_id,
  product_name: data.product_name,
  seller_id: data.seller_id,
  seller_name: data.seller_name,
  status: data.status as OrderStatus,
  notes: data.notes || undefined,
  total_amount: data.total_amount,
  owner_id: data.owner_id,
  created_at: data.created_at || undefined,
  updated_at: data.updated_at || undefined
});

export class EcommerceService {
  private static readonly PRODUCTS_TABLE = 'ecommerce_products' as const;
  private static readonly CATEGORIES_TABLE = 'ecommerce_categories';
  private static readonly SETTINGS_TABLE = 'ecommerce_settings';
  private static readonly REVIEWS_TABLE = 'product_reviews';
  private static readonly CART_STORAGE_KEY = 'fiscal_flow_cart';
  private static readonly STORE_INFO_STORAGE_KEY = 'fiscal_flow_store_info';
  private static readonly PRODUCTS_CACHE_KEY = 'fiscal_flow_products_cache';
  private static readonly PRODUCTS_TIMESTAMP_KEY = 'fiscal_flow_products_timestamp';
  private static readonly CACHE_EXPIRY = 5 * 60 * 1000;
  private static readonly SELLERS_TABLE = 'sellers';
  private static readonly CUSTOMERS_TABLE = 'customers';
  private static readonly ORDERS_TABLE = 'orders_kanban' as const;
  
  // Produtos
  static async getProducts(ownerId: string): Promise<EcommerceProduct[]> {
    const { data, error } = await supabase
      .from(this.PRODUCTS_TABLE)
      .select('*')
      .eq('owner_id', ownerId);

    if (error) {
      throw error;
    }

    return (data as EcommerceProductRow[]).map(product => ({
      id: product.id,
      name: product.name,
      code: product.code,
      description: product.description || undefined,
      price: product.price,
      image_path: product.image_path || undefined,
      ncm: product.ncm || undefined,
      unit: product.unit || undefined,
      quantity: product.quantity,
      total_amount: product.total_amount || undefined,
      category_id: product.category_id || undefined,
      owner_id: product.owner_id,
      created_at: product.created_at || undefined,
      updated_at: product.updated_at || undefined
    }));
  }
  
  static async getProductById(id: string): Promise<EcommerceProduct | null> {
    try {
      const { data, error } = await supabase
        .from(this.PRODUCTS_TABLE)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? mapSupabaseProduct(data) : null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
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
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } : null;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  }

  static async updateCategory(id: string, categoryUpdate: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Category | null> {
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
        createdAt: data.created_at,
        updatedAt: data.updated_at
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
  
  static async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.PRODUCTS_TABLE)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao excluir produto:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      return false;
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
  
  static addToCart(product: EcommerceProduct, quantity: number = 1): CartItem[] {
    try {
      const cart = this.getCart();
      
      // Verificar se o produto já está no carrinho
      const existingItemIndex = cart.findIndex(item => item.productId === product.id);
      
      if (existingItemIndex >= 0) {
        // Atualizar quantidade se já existe
        cart[existingItemIndex].quantity += quantity;
        cart[existingItemIndex].subtotal = cart[existingItemIndex].price * cart[existingItemIndex].quantity;
      } else {
        // Adicionar novo item
        const newItem: CartItem = {
          id: uuidv4(),
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          imageUrl: product.image_path || '',
          unit: product.unit,
          subtotal: product.price * quantity
        };
        
        cart.push(newItem);
      }
      
      // Salvar carrinho atualizado
      this.saveCart(cart);
      return cart;
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      return this.getCart();
    }
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
  
  static getCartTotal(): number {
    try {
      const cart = this.getCart();
      return cart.reduce((total, item) => total + item.subtotal, 0);
    } catch (error) {
      console.error('Erro ao calcular total do carrinho:', error);
      return 0;
    }
  }
  
  // Cache para informações da loja
  private static storeInfoCache: StoreInfo | null = null;
  private static storeInfoCacheTimestamp: number = 0;

  // Obter informações da loja com cache
  static async getStoreInfo(forceRefresh: boolean = false, ownerId?: string): Promise<StoreInfo> {
    return getPublicStoreSettings(ownerId);
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
    const allOrders = await this.getOrders(ownerId);
    
    // Calcular métricas
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalOrders = allOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Agrupar por status
    const salesByStatus = allOrders.reduce((acc, order) => {
      const status = order.status;
      if (!acc[status]) {
        acc[status] = { count: 0, revenue: 0 };
      }
      acc[status].count++;
      acc[status].revenue += order.total_amount || 0;
      return acc;
    }, {} as { [key in OrderStatus]: { count: number; revenue: number } });

    // Top produtos
    const productStats = allOrders.reduce((acc, order) => {
      if (!acc[order.product_name]) {
        acc[order.product_name] = { revenue: 0, orders: 0 };
      }
      acc[order.product_name].orders++;
      acc[order.product_name].revenue += order.total_amount || 0;
      return acc;
    }, {} as { [key: string]: { revenue: number; orders: number } });

    const topProducts = Object.entries(productStats)
      .map(([name, stats]) => ({
        name,
        revenue: stats.revenue,
        orders: stats.orders
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Pedidos recentes
    const recentOrders = allOrders
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5)
      .map(order => ({
        id: order.id,
        customer_name: order.customer_name,
        created_at: order.created_at,
        status: order.status,
        product_name: order.product_name,
        total_amount: order.total_amount
      }));

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      topProducts,
      recentOrders,
      salesByStatus
    };
  }
} 