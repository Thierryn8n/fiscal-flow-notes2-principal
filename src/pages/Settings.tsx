import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CompanySettings } from '@/components/settings/CompanySettings';
import { DeliverySettings } from '@/components/settings/DeliverySettings';
import { PrinterSettings } from '@/components/settings/PrinterSettings';
import { InstallmentSettings } from '@/components/settings/InstallmentSettings';
import { UserSettings } from '@/types/settings';
import { loadSettings, saveSettings } from '@/lib/supabaseSettings';

export const Settings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSettings(user.id)
        .then(loadedSettings => {
          setSettings(loadedSettings);
          setIsLoading(false);
        })
        .catch(error => {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as configurações.',
          variant: 'destructive',
        });
          setIsLoading(false);
        });
    }
  }, [user]);

  const handleSave = async () => {
    if (!settings || !user) return;

    try {
      await saveSettings(settings);
      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso!',
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

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!settings) {
    return <div>Nenhuma configuração encontrada.</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <div className="grid gap-6">
            <CompanySettings
              settings={settings}
              setSettings={setSettings}
          onSave={handleSave} 
        />
        
        <DeliverySettings 
          settings={settings} 
          setSettings={setSettings} 
          onSave={handleSave} 
        />
        
            <PrinterSettings
              settings={settings}
              setSettings={setSettings}
          onSave={handleSave} 
            />

        <InstallmentSettings 
              settings={settings}
              setSettings={setSettings}
          onSave={handleSave} 
            />
      </div>
    </div>
  );
};