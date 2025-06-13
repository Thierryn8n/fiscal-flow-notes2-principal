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
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          company_data: {
          name: string;
            cnpj: string;
            address: string;
            phone: string;
            email: string;
            logo_url?: string;
          };
          printer_settings: {
            enabled: boolean;
            auto_print: boolean;
            copies: number;
            default_printer?: string;
          };
          delivery_settings: {
            delivery_radii: Array<{
              id: string;
              radius: number;
              fee: number;
              center: {
                lat: number;
                lng: number;
              };
            }>;
          };
          installment_fees: Array<{
            installments: number;
            fee_percentage: number;
          }>;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_data: {
          name: string;
            cnpj: string;
            address: string;
            phone: string;
            email: string;
            logo_url?: string;
        };
          printer_settings: {
            enabled: boolean;
            auto_print: boolean;
            copies: number;
            default_printer?: string;
        };
          delivery_settings: {
            delivery_radii: Array<{
              id: string;
              radius: number;
              fee: number;
              center: {
                lat: number;
                lng: number;
        };
            }>;
          };
          installment_fees: Array<{
            installments: number;
            fee_percentage: number;
          }>;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_data?: {
            name: string;
            cnpj: string;
            address: string;
            phone: string;
            email: string;
            logo_url?: string;
          };
          printer_settings?: {
            enabled: boolean;
            auto_print: boolean;
            copies: number;
            default_printer?: string;
        };
          delivery_settings?: {
            delivery_radii: Array<{
          id: string;
              radius: number;
              fee: number;
              center: {
                lat: number;
                lng: number;
              };
            }>;
        };
          installment_fees?: Array<{
            installments: number;
            fee_percentage: number;
          }>;
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