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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      print_status: [
        "pending",
        "processing",
        "completed",
        "error",
        "cancelled",
      ],
      print_type: ["fiscal_note", "budget", "receipt", "report"],
    },
  },
} as const
