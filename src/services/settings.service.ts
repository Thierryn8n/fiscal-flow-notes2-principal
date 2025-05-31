import { supabase } from '@/integrations/supabase/client';
import { UserSettings, CompanyData, DeliverySettings, InstallmentFee, PrinterSettings, EcommerceSettings } from '@/types/settings';

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
      
      // Transform the data to match our TypeScript types
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
      const { data, error } = await supabase
        .from('user_settings')
        .insert([{
          user_id: userId,
          company_data: settings.company_data || {},
          installment_fees: settings.installment_fees || [],
          delivery_settings: settings.delivery_settings || { delivery_radii: [] },
          printer_settings: settings.printer_settings || { default_printer: '', auto_print: false },
          ecommerce_settings: settings.ecommerce_settings || { enabled: false, admin_panel_enabled: false },
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user settings:', error);
        return null;
      }
      
      if (!data) return null;
      
      // Transform the data to match our TypeScript types
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
      const updateData: Partial<UserSettings> = {};
      if (settings.company_data) updateData.company_data = settings.company_data as any;
      if (settings.installment_fees) updateData.installment_fees = settings.installment_fees as any;
      if (settings.delivery_settings) updateData.delivery_settings = settings.delivery_settings as any;
      if (settings.printer_settings) updateData.printer_settings = settings.printer_settings as any;
      if (settings.ecommerce_settings) updateData.ecommerce_settings = settings.ecommerce_settings as any;

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
      
      // Transform the data to match our TypeScript types
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