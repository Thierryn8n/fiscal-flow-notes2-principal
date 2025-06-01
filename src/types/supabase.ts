export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
        Insert: {
          id?: string;
          name: string;
          code: string;
          description?: string | null;
          price: number;
          image_path?: string | null;
          ncm?: string | null;
          unit?: string | null;
          quantity?: number;
          total_amount?: number | null;
          category_id?: string | null;
          owner_id: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          price?: number;
          image_path?: string | null;
          ncm?: string | null;
          unit?: string | null;
          quantity?: number;
          total_amount?: number | null;
          category_id?: string | null;
          owner_id?: string;
          created_at?: string | null;
          updated_at?: string | null;
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
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      ecommerce_settings: {
        Row: {
          id: string;
          store_name: string;
          store_description: string | null;
          logo_url: string | null;
          banner_url: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          background_color: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          contact_address: string | null;
          owner_id: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          store_name: string;
          store_description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          background_color?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          contact_address?: string | null;
          owner_id: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          store_name?: string;
          store_description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          background_color?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          contact_address?: string | null;
          owner_id?: string;
          created_at?: string | null;
          updated_at?: string | null;
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
          status: string;
          notes: string | null;
          total_amount: number;
          owner_id: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          customer_id: string;
          customer_name: string;
          product_id: string;
          product_name: string;
          seller_id: string;
          seller_name: string;
          status: string;
          notes?: string | null;
          total_amount: number;
          owner_id: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          customer_id?: string;
          customer_name?: string;
          product_id?: string;
          product_name?: string;
          seller_id?: string;
          seller_name?: string;
          status?: string;
          notes?: string | null;
          total_amount?: number;
          owner_id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string;
          address: Json;
          owner_id: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone: string;
          address: Json;
          owner_id: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string;
          address?: Json;
          owner_id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      sellers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          active: boolean | null;
          auth_user_id: string | null;
          owner_id: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          active?: boolean | null;
          auth_user_id?: string | null;
          owner_id: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          active?: boolean | null;
          auth_user_id?: string | null;
          owner_id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      fiscal_notes: {
        Row: {
          id: string;
          note_number: string;
          note_data: Json;
          payment_data: Json;
          total_value: number;
          status: string;
          owner_id: string;
          printed_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          note_number: string;
          note_data: Json;
          payment_data: Json;
          total_value: number;
          status: string;
          owner_id: string;
          printed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          note_number?: string;
          note_data?: Json;
          payment_data?: Json;
          total_value?: number;
          status?: string;
          owner_id?: string;
          printed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      print_requests: {
        Row: {
          id: string;
          note_id: string;
          print_settings_id: string | null;
          device_id: string | null;
          copies: number | null;
          status: string;
          error_message: string | null;
          created_by: string;
          created_at: string;
          updated_at: string | null;
          note_data: Json;
        };
        Insert: {
          id?: string;
          note_id: string;
          print_settings_id?: string | null;
          device_id?: string | null;
          copies?: number | null;
          status: string;
          error_message?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string | null;
          note_data: Json;
        };
        Update: {
          id?: string;
          note_id?: string;
          print_settings_id?: string | null;
          device_id?: string | null;
          copies?: number | null;
          status?: string;
          error_message?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string | null;
          note_data?: Json;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
} 