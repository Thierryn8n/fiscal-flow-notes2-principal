import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { executeWithTokenRefresh, isJwtExpiredError } from '@/utils/auth-helpers';
import { UserSettings } from '@/types/settings';
import { Database } from '@/types/supabase';

type DbUserSettings = Database['public']['Tables']['user_settings'];
type UserSettingsRow = DbUserSettings['Row'];
type UserSettingsInsert = DbUserSettings['Insert'];

// Interfaces para as configurações de usuário
export interface CompanyData {
  name: string;
  cnpj: string;
  address: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone: string;
  email: string;
  logo_url?: string;
  logo_path?: string;
}

export interface InstallmentFee {
  installments: number;
  fee_percentage: number;
}

export interface DeliverySettings {
  delivery_radii: DeliveryRadius[];
}

export interface DeliveryRadius {
  id: string;
  distance: number;
  fee: number;
}

export interface PrinterSettings {
  default_printer: string;
  auto_print: boolean;
}

// Nome do bucket para armazenar logos
const LOGO_BUCKET = 'company_logos';

/**
 * Carrega as configurações do usuário do Supabase
 * @param userId ID do usuário
 * @returns Configurações do usuário ou uma configuração padrão se não existir
 */
export async function loadSettings(userId: string): Promise<UserSettings | null> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (isJwtExpiredError(error)) {
        return await executeWithTokenRefresh(() => loadSettings(userId));
      }
      throw error;
    }

    if (!data) {
      return null;
    }

    const row = data as unknown as UserSettingsRow;
    return {
      id: row.id,
      user_id: row.user_id,
      company_data: row.company_data,
      printer_settings: row.printer_settings,
      delivery_settings: row.delivery_settings,
      installment_fees: row.installment_fees,
      created_at: row.created_at || undefined,
      updated_at: row.updated_at || undefined
    };
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    throw error;
  }
}

/**
 * Salva as configurações do usuário no Supabase
 * @param settings Configurações do usuário
 * @returns Status da operação
 */
export async function saveSettings(settings: UserSettings): Promise<void> {
  try {
    const insertData: UserSettingsInsert = {
      user_id: settings.user_id,
      company_data: settings.company_data,
      printer_settings: settings.printer_settings,
      delivery_settings: settings.delivery_settings,
      installment_fees: settings.installment_fees,
      updated_at: new Date().toISOString()
    };

    if (settings.id) {
      insertData.id = settings.id;
    }

    const { error } = await supabase
      .from('user_settings')
      .upsert(insertData);

    if (error) {
      if (isJwtExpiredError(error)) {
        await executeWithTokenRefresh(() => saveSettings(settings));
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    throw error;
  }
}

/**
 * Faz upload do logo da empresa para o Supabase Storage
 * @param userId ID do usuário
 * @param file Arquivo do logo
 * @returns URL pública e caminho do arquivo
 */
export async function uploadCompanyLogo(userId: string, file: File): Promise<{ url: string; path: string } | null> {
  try {
    const uploadLogoOperation = async () => {
      // Verificar se é uma imagem válida
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/i)) {
        throw new Error('Formato de arquivo inválido. Use JPEG, PNG, GIF ou WebP.');
      }

      // Limitar tamanho do arquivo (2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('O tamanho do arquivo não pode exceder 2MB.');
      }

      // Criar nome de arquivo único
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${uuidv4()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Fazer upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from(LOGO_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        // Se for erro de JWT expirado, indicar para o executeWithTokenRefresh
        if (isJwtExpiredError(uploadError)) {
          throw uploadError;
        }
        console.error('Erro ao fazer upload do logo:', uploadError);
        return null;
      }

      // Obter URL pública do arquivo
      const { data: urlData } = await supabase.storage
        .from(LOGO_BUCKET)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Não foi possível obter a URL pública do logo.');
      }

      return {
        url: urlData.publicUrl,
        path: filePath
      };
    };

    // Executa com renovação de token automática se necessário
    return await executeWithTokenRefresh(uploadLogoOperation);
  } catch (error: any) {
    console.error('Erro ao fazer upload do logo:', error);
    return null;
  }
}

/**
 * Remove o logo da empresa do Supabase Storage
 * @param filePath Caminho do arquivo no Storage
 * @returns Status da operação
 */
export async function removeCompanyLogo(filePath: string): Promise<boolean> {
  try {
    const removeLogoOperation = async () => {
      const { error } = await supabase.storage
        .from(LOGO_BUCKET)
        .remove([filePath]);

      if (error) {
        // Se for erro de JWT expirado, indicar para o executeWithTokenRefresh
        if (isJwtExpiredError(error)) {
          throw error;
        }
        console.error('Erro ao remover logo:', error);
        return false;
      }

      return true;
    };

    // Executa com renovação de token automática se necessário
    const result = await executeWithTokenRefresh(removeLogoOperation);
    return result === true;
  } catch (error) {
    console.error('Erro ao remover logo:', error);
    return false;
  }
} 