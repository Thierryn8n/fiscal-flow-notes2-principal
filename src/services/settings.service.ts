import { supabase } from '@/integrations/supabase/client';
import { UserSettings, CompanyData, DeliverySettings, InstallmentFee, PrinterSettings, EcommerceSettings } from '@/types/settings';
import { Database } from '@/types/supabase';

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

interface UserSettingsRow {
  id: string;
  user_id: string;
  company_data: Json;
  installment_fees: Json;
  delivery_settings: Json;
  printer_settings: Json;
  ecommerce_settings: Json;
  created_at: string | null;
  updated_at: string | null;
}

export const SettingsService = {
  async getUserSettings(): Promise<UserSettings | null> {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    
    if (!userId) {
      console.error('User not authenticated');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error fetching user settings:', error);
        }
        return null;
      }
      
      if (!data) return null;
      
      return {
        id: data.id,
        user_id: data.user_id,
        company_data: data.company_data as unknown as CompanyData,
        installment_fees: data.installment_fees as unknown as InstallmentFee[],
        delivery_settings: data.delivery_settings as unknown as DeliverySettings,
        printer_settings: data.printer_settings as unknown as PrinterSettings,
        ecommerce_settings: data.ecommerce_settings as unknown as EcommerceSettings,
        created_at: data.created_at || undefined,
        updated_at: data.updated_at || undefined
      };
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
  },

  async createUserSettings(settings: Partial<UserSettings>): Promise<UserSettings | null> {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    
    if (!userId) {
      console.error('User not authenticated');
      return null;
    }
    
    try {
      const defaultSettings = {
        user_id: userId,
        company_data: settings.company_data || { name: '' } as unknown as Json,
        installment_fees: settings.installment_fees || [] as unknown as Json,
        delivery_settings: settings.delivery_settings || { delivery_radii: [] } as unknown as Json,
        printer_settings: settings.printer_settings || { enabled: false, auto_print: false, copies: 1 } as unknown as Json,
        ecommerce_settings: settings.ecommerce_settings || { enabled: false, admin_panel_enabled: false } as unknown as Json
      };

      const { data, error } = await supabase
        .from('user_settings')
        .insert(defaultSettings)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user settings:', error);
        return null;
      }
      
      if (!data) return null;
      
      return {
        id: data.id,
        user_id: data.user_id,
        company_data: data.company_data as unknown as CompanyData,
        installment_fees: data.installment_fees as unknown as InstallmentFee[],
        delivery_settings: data.delivery_settings as unknown as DeliverySettings,
        printer_settings: data.printer_settings as unknown as PrinterSettings,
        ecommerce_settings: data.ecommerce_settings as unknown as EcommerceSettings,
        created_at: data.created_at || undefined,
        updated_at: data.updated_at || undefined
      };
    } catch (error) {
      console.error('Error creating user settings:', error);
      return null;
    }
  },

  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings | null> {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    
    if (!userId) {
      console.error('User not authenticated');
      return null;
    }
    
    try {
      const updateData = {} as Record<string, Json>;
      if (settings.company_data) updateData.company_data = settings.company_data as unknown as Json;
      if (settings.installment_fees) updateData.installment_fees = settings.installment_fees as unknown as Json;
      if (settings.delivery_settings) updateData.delivery_settings = settings.delivery_settings as unknown as Json;
      if (settings.printer_settings) updateData.printer_settings = settings.printer_settings as unknown as Json;
      if (settings.ecommerce_settings) updateData.ecommerce_settings = settings.ecommerce_settings as unknown as Json;

      const { data, error } = await supabase
        .from('user_settings')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating user settings:', error);
        return null;
      }
      
      if (!data) return null;
      
      return {
        id: data.id,
        user_id: data.user_id,
        company_data: data.company_data as unknown as CompanyData,
        installment_fees: data.installment_fees as unknown as InstallmentFee[],
        delivery_settings: data.delivery_settings as unknown as DeliverySettings,
        printer_settings: data.printer_settings as unknown as PrinterSettings,
        ecommerce_settings: data.ecommerce_settings as unknown as EcommerceSettings,
        created_at: data.created_at || undefined,
        updated_at: data.updated_at || undefined
      };
    } catch (error) {
      console.error('Error updating user settings:', error);
      return null;
    }
  },

  async uploadCompanyLogo(file: File): Promise<string | null> {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    
    if (!userId) {
      console.error('User not authenticated');
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/logo.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('company_logos')
        .upload(fileName, file, {
          upsert: true,
        });
      
      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        return null;
      }
      
      const { data: publicUrl } = supabase.storage
        .from('company_logos')
        .getPublicUrl(fileName);
      
      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Error uploading company logo:', error);
      return null;
    }
  }
}; 