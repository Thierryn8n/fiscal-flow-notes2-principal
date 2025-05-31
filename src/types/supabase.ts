export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ecommerce_products: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          price: number;
          image_path: string | null;
          ncm: string | null;
          unit: string | null;
          quantity: number;
          total_amount: number | null;
          category_id: string | null;
          owner_id: string;
          created_at: string | null;
          updated_at: string | null;
        };
      };
      ecommerce_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
      };
      ecommerce_settings: {
        Row: {
          id: string;
          owner_id: string;
          accent_color: string | null;
          background_color: string | null;
          banner_image_url: string | null;
          border_radius: number | null;
          button_style: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
      };
      product_reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          author_name: string;
          rating: number;
          comment: string;
          created_at: string;
          updated_at: string | null;
        };
      };
      orders_kanban: {
        Row: {
          id: string;
          customer_id: string;
          customer_name: string;
          product_id: string;
          product_name: string;
          seller_id: string;
          seller_name: string;
          status: 'pending' | 'processing' | 'completed' | 'cancelled';
          notes: string | null;
          owner_id: string;
          total_amount: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          address: Json;
          signature: string | null;
          owner_id: string;
          created_at: string | null;
          updated_at: string | null;
        };
      };
      sellers: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string;
          image_path: string | null;
          active: boolean | null;
          auth_user_id: string | null;
          owner_id: string;
          created_at: string | null;
          updated_at: string | null;
        };
      };
    };
  };
} 