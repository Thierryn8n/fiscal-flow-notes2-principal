import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompanySettings } from '@/components/settings/CompanySettings';
import { PrinterSettings } from '@/components/settings/PrinterSettings';
import { EcommerceSettings } from '@/components/settings/EcommerceSettings';

interface UserSettings {
  id?: string;
  user_id: string;
  company_data: {
    name: string;
    logo?: string;
    address?: {
      street?: string;
      number?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
  };
  printer_settings: {
    enabled: boolean;
    default_printer?: string;
    auto_print: boolean;
    copies: number;
  };
  ecommerce_settings: {
    enabled: boolean;
    admin_panel_enabled: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

const defaultSettings: UserSettings = {
  user_id: '',
  company_data: {
    name: '',
  },
  printer_settings: {
    enabled: false,
    auto_print: false,
    copies: 1,
  },
  ecommerce_settings: {
    enabled: false,
    admin_panel_enabled: false,
  },
};

export default function Settings() {
  const auth = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth?.user?.id) {
      loadSettings();
    }
  }, [auth?.user?.id]);

  const loadSettings = async () => {
    if (!auth?.user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', auth.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!auth?.user?.id) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: auth.user.id,
          ...settings,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    }
  };

  if (!auth?.user) {
    return <div>Você precisa estar autenticado para acessar esta página.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <Tabs defaultValue="company" className="space-y-4">
          <TabsList>
            <TabsTrigger value="company">Empresa</TabsTrigger>
            <TabsTrigger value="printer">Impressora</TabsTrigger>
            <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
            </TabsList>

          <TabsContent value="company">
            <CompanySettings
              settings={settings}
              setSettings={setSettings}
              onSave={saveSettings}
            />
          </TabsContent>

          <TabsContent value="printer">
            <PrinterSettings
              settings={settings}
              setSettings={setSettings}
              onSave={saveSettings}
            />
          </TabsContent>

          <TabsContent value="ecommerce">
            <EcommerceSettings
              settings={settings}
              setSettings={setSettings}
              onSave={saveSettings}
            />
          </TabsContent>
        </Tabs>
      )}
      </div>
  );
} 