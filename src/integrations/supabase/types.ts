export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          address: Json | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          owner_id: string
          phone: string
          signature: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          owner_id: string
          phone: string
          signature?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          owner_id?: string
          phone?: string
          signature?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ecommerce_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ecommerce_product_card_styles: {
        Row: {
          button_text: string | null
          buttons_display_style: string | null
          card_background_color: string | null
          card_border_color: string | null
          card_border_enabled: boolean | null
          card_border_radius: number | null
          card_border_width: number | null
          card_hover_effect: string | null
          card_shadow_enabled: boolean | null
          card_shadow_intensity: number | null
          created_at: string | null
          display_discount_percentage: boolean | null
          display_original_price: boolean | null
          display_price: boolean | null
          display_product_name: boolean | null
          id: number
          image_aspect_ratio: string | null
          image_fit: string | null
          secondary_button_enabled: boolean | null
          secondary_button_text: string | null
          settings_id: number | null
          updated_at: string | null
        }
        Insert: {
          button_text?: string | null
          buttons_display_style?: string | null
          card_background_color?: string | null
          card_border_color?: string | null
          card_border_enabled?: boolean | null
          card_border_radius?: number | null
          card_border_width?: number | null
          card_hover_effect?: string | null
          card_shadow_enabled?: boolean | null
          card_shadow_intensity?: number | null
          created_at?: string | null
          display_discount_percentage?: boolean | null
          display_original_price?: boolean | null
          display_price?: boolean | null
          display_product_name?: boolean | null
          id?: number
          image_aspect_ratio?: string | null
          image_fit?: string | null
          secondary_button_enabled?: boolean | null
          secondary_button_text?: string | null
          settings_id?: number | null
          updated_at?: string | null
        }
        Update: {
          button_text?: string | null
          buttons_display_style?: string | null
          card_background_color?: string | null
          card_border_color?: string | null
          card_border_enabled?: boolean | null
          card_border_radius?: number | null
          card_border_width?: number | null
          card_hover_effect?: string | null
          card_shadow_enabled?: boolean | null
          card_shadow_intensity?: number | null
          created_at?: string | null
          display_discount_percentage?: boolean | null
          display_original_price?: boolean | null
          display_price?: boolean | null
          display_product_name?: boolean | null
          id?: number
          image_aspect_ratio?: string | null
          image_fit?: string | null
          secondary_button_enabled?: boolean | null
          secondary_button_text?: string | null
          settings_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ecommerce_product_card_styles_settings_id_fkey"
            columns: ["settings_id"]
            isOneToOne: true
            referencedRelation: "ecommerce_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      ecommerce_settings: {
        Row: {
          accent_color: string | null
          background_color: string | null
          banner_image_url: string | null
          border_radius: number | null
          button_style: string | null
          created_at: string | null
          display_product_quick_view: boolean | null
          enable_wishlist: boolean | null
          favicon_url: string | null
          font_family: string | null
          footer_background_color: string | null
          footer_card_flags: string | null
          footer_credits: string | null
          footer_custom_text: string | null
          footer_payment_methods: string | null
          footer_social_facebook: string | null
          footer_social_instagram: string | null
          footer_social_linkedin: string | null
          footer_social_twitter: string | null
          footer_social_youtube: string | null
          header_background_color: string | null
          id: number
          logo_url: string | null
          logo_width: number | null
          meta_keywords: string | null
          owner_id: string | null
          primary_color: string | null
          product_cards_per_row: number | null
          secondary_color: string | null
          show_discount_badge: boolean | null
          show_product_ratings: boolean | null
          show_social_share_buttons: boolean | null
          store_address: string | null
          store_cnpj: string | null
          store_description: string | null
          store_email: string | null
          store_name: string | null
          store_phone: string | null
          theme_id: string | null
          updated_at: string | null
          use_overlay_text: boolean | null
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          banner_image_url?: string | null
          border_radius?: number | null
          button_style?: string | null
          created_at?: string | null
          display_product_quick_view?: boolean | null
          enable_wishlist?: boolean | null
          favicon_url?: string | null
          font_family?: string | null
          footer_background_color?: string | null
          footer_card_flags?: string | null
          footer_credits?: string | null
          footer_custom_text?: string | null
          footer_payment_methods?: string | null
          footer_social_facebook?: string | null
          footer_social_instagram?: string | null
          footer_social_linkedin?: string | null
          footer_social_twitter?: string | null
          footer_social_youtube?: string | null
          header_background_color?: string | null
          id?: number
          logo_url?: string | null
          logo_width?: number | null
          meta_keywords?: string | null
          owner_id?: string | null
          primary_color?: string | null
          product_cards_per_row?: number | null
          secondary_color?: string | null
          show_discount_badge?: boolean | null
          show_product_ratings?: boolean | null
          show_social_share_buttons?: boolean | null
          store_address?: string | null
          store_cnpj?: string | null
          store_description?: string | null
          store_email?: string | null
          store_name?: string | null
          store_phone?: string | null
          theme_id?: string | null
          updated_at?: string | null
          use_overlay_text?: boolean | null
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          banner_image_url?: string | null
          border_radius?: number | null
          button_style?: string | null
          created_at?: string | null
          display_product_quick_view?: boolean | null
          enable_wishlist?: boolean | null
          favicon_url?: string | null
          font_family?: string | null
          footer_background_color?: string | null
          footer_card_flags?: string | null
          footer_credits?: string | null
          footer_custom_text?: string | null
          footer_payment_methods?: string | null
          footer_social_facebook?: string | null
          footer_social_instagram?: string | null
          footer_social_linkedin?: string | null
          footer_social_twitter?: string | null
          footer_social_youtube?: string | null
          header_background_color?: string | null
          id?: number
          logo_url?: string | null
          logo_width?: number | null
          meta_keywords?: string | null
          owner_id?: string | null
          primary_color?: string | null
          product_cards_per_row?: number | null
          secondary_color?: string | null
          show_discount_badge?: boolean | null
          show_product_ratings?: boolean | null
          show_social_share_buttons?: boolean | null
          store_address?: string | null
          store_cnpj?: string | null
          store_description?: string | null
          store_email?: string | null
          store_name?: string | null
          store_phone?: string | null
          theme_id?: string | null
          updated_at?: string | null
          use_overlay_text?: boolean | null
        }
        Relationships: []
      }
      ecommerce_themes: {
        Row: {
          accent_color: string
          background_color: string
          border_radius: number
          button_style: string
          created_at: string | null
          description: string | null
          font_family: string
          footer_background_color: string
          header_background_color: string
          id: number
          is_default: boolean | null
          name: string
          primary_color: string
          secondary_color: string
          updated_at: string | null
        }
        Insert: {
          accent_color: string
          background_color: string
          border_radius: number
          button_style: string
          created_at?: string | null
          description?: string | null
          font_family: string
          footer_background_color: string
          header_background_color: string
          id?: number
          is_default?: boolean | null
          name: string
          primary_color: string
          secondary_color: string
          updated_at?: string | null
        }
        Update: {
          accent_color?: string
          background_color?: string
          border_radius?: number
          button_style?: string
          created_at?: string | null
          description?: string | null
          font_family?: string
          footer_background_color?: string
          header_background_color?: string
          id?: number
          is_default?: boolean | null
          name?: string
          primary_color?: string
          secondary_color?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fiscal_notes: {
        Row: {
          created_at: string | null
          customer_data: Json
          date: string
          id: string
          note_number: string
          owner_id: string
          payment_data: Json
          printed_at: string | null
          products: Json
          seller_id: string | null
          seller_name: string | null
          status: string
          total_value: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_data: Json
          date: string
          id?: string
          note_number: string
          owner_id: string
          payment_data: Json
          printed_at?: string | null
          products: Json
          seller_id?: string | null
          seller_name?: string | null
          status: string
          total_value: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_data?: Json
          date?: string
          id?: string
          note_number?: string
          owner_id?: string
          payment_data?: Json
          printed_at?: string | null
          products?: Json
          seller_id?: string | null
          seller_name?: string | null
          status?: string
          total_value?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_notes_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_versions: {
        Row: {
          applied_at: string | null
          id: number
          name: string
        }
        Insert: {
          applied_at?: string | null
          id?: number
          name: string
        }
        Update: {
          applied_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      orders_kanban: {
        Row: {
          created_at: string | null
          customer_id: string
          customer_name: string
          id: string
          notes: string | null
          owner_id: string | null
          product_id: string
          product_name: string
          seller_id: string
          seller_name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          customer_name: string
          id?: string
          notes?: string | null
          owner_id?: string | null
          product_id: string
          product_name: string
          seller_id: string
          seller_name: string
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          customer_name?: string
          id?: string
          notes?: string | null
          owner_id?: string | null
          product_id?: string
          product_name?: string
          seller_id?: string
          seller_name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      print_history: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          print_request_id: string | null
          printed_by: string | null
          printer_id: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          print_request_id?: string | null
          printed_by?: string | null
          printer_id?: string | null
          status: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          print_request_id?: string | null
          printed_by?: string | null
          printer_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "print_history_print_request_id_fkey"
            columns: ["print_request_id"]
            isOneToOne: false
            referencedRelation: "print_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      print_requests: {
        Row: {
          copies: number | null
          created_at: string
          created_by: string
          device_id: string | null
          error_message: string | null
          id: string
          note_data: Json
          note_id: string
          print_settings_id: string | null
          print_type: string | null
          printed_at: string | null
          printed_by: string | null
          printer_id: string | null
          status: string
        }
        Insert: {
          copies?: number | null
          created_at?: string
          created_by: string
          device_id?: string | null
          error_message?: string | null
          id?: string
          note_data: Json
          note_id: string
          print_settings_id?: string | null
          print_type?: string | null
          printed_at?: string | null
          printed_by?: string | null
          printer_id?: string | null
          status: string
        }
        Update: {
          copies?: number | null
          created_at?: string
          created_by?: string
          device_id?: string | null
          error_message?: string | null
          id?: string
          note_data?: Json
          note_id?: string
          print_settings_id?: string | null
          print_type?: string | null
          printed_at?: string | null
          printed_by?: string | null
          printer_id?: string | null
          status?: string
        }
        Relationships: []
      }
      print_settings: {
        Row: {
          company_address: string | null
          company_cnpj: string | null
          company_ie: string | null
          company_logo: string | null
          company_name: string
          company_phone: string | null
          created_at: string | null
          created_by: string | null
          default_printer: string | null
          footer_message: string | null
          header_message: string | null
          id: string
          paper_width: number | null
          updated_at: string | null
        }
        Insert: {
          company_address?: string | null
          company_cnpj?: string | null
          company_ie?: string | null
          company_logo?: string | null
          company_name: string
          company_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          default_printer?: string | null
          footer_message?: string | null
          header_message?: string | null
          id?: string
          paper_width?: number | null
          updated_at?: string | null
        }
        Update: {
          company_address?: string | null
          company_cnpj?: string | null
          company_ie?: string | null
          company_logo?: string | null
          company_name?: string
          company_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          default_printer?: string | null
          footer_message?: string | null
          header_message?: string | null
          id?: string
          paper_width?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          author_name: string | null
          comment: string | null
          created_at: string | null
          id: string
          product_id: string
          rating: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          author_name?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          rating: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          author_name?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          image_path: string | null
          imageurl: string | null
          name: string
          ncm: string | null
          owner_id: string
          price: number
          quantity: number | null
          total: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_path?: string | null
          imageurl?: string | null
          name: string
          ncm?: string | null
          owner_id: string
          price: number
          quantity?: number | null
          total?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_path?: string | null
          imageurl?: string | null
          name?: string
          ncm?: string | null
          owner_id?: string
          price?: number
          quantity?: number | null
          total?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ecommerce_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sellers: {
        Row: {
          active: boolean | null
          auth_user_id: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          image_path: string | null
          owner_id: string
          phone: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          auth_user_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          image_path?: string | null
          owner_id: string
          phone: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          auth_user_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          image_path?: string | null
          owner_id?: string
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: number
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          company_data: Json
          created_at: string | null
          delivery_settings: Json
          ecommerce_settings: Json
          id: string
          installment_fees: Json
          printer_settings: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_data?: Json
          created_at?: string | null
          delivery_settings?: Json
          ecommerce_settings?: Json
          id?: string
          installment_fees?: Json
          printer_settings?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_data?: Json
          created_at?: string | null
          delivery_settings?: Json
          ecommerce_settings?: Json
          id?: string
          installment_fees?: Json
          printer_settings?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_print_requests: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_seller_with_account: {
        Args: {
          p_full_name: string
          p_email: string
          p_phone: string
          p_password: string
          p_owner_id: string
        }
        Returns: string
      }
      deactivate_seller: {
        Args: { p_seller_id: string; p_owner_id: string }
        Returns: boolean
      }
      get_notes_stats: {
        Args: {
          p_owner_id: string
          p_start_date?: string
          p_end_date?: string
          p_seller_id?: string
        }
        Returns: Json
      }
      mark_note_as_printed: {
        Args: { p_note_id: string; p_owner_id: string }
        Returns: boolean
      }
      search_customers: {
        Args: { p_owner_id: string; p_search_term: string }
        Returns: {
          address: Json | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          owner_id: string
          phone: string
          signature: string | null
          updated_at: string | null
        }[]
      }
      storage_public_url: {
        Args: { bucket: string; file_path: string }
        Returns: string
      }
      update_seller_image: {
        Args: { p_seller_id: string; p_image_path: string; p_owner_id: string }
        Returns: boolean
      }
    }
    Enums: {
      print_status:
        | "pending"
        | "processing"
        | "completed"
        | "error"
        | "cancelled"
      print_type: "fiscal_note" | "budget" | "receipt" | "report"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
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
