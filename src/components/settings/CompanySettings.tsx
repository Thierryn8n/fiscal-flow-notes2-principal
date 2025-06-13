import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUploader } from '@/components/ui/file-uploader';

interface CompanySettingsProps {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  onSave: () => void;
}

export const CompanySettings = ({ settings, setSettings, onSave }: CompanySettingsProps) => {
  const handleChange = (field: keyof typeof settings.company_data, value: string) => {
    setSettings({
      ...settings,
      company_data: {
        ...settings.company_data,
        [field]: value
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da Empresa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="name">Nome da Empresa</label>
            <Input
              id="name"
              value={settings.company_data.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="cnpj">CNPJ</label>
            <Input
              id="cnpj"
              value={settings.company_data.cnpj}
              onChange={(e) => handleChange('cnpj', e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="address">Endereço</label>
            <Input
              id="address"
              value={settings.company_data.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="phone">Telefone</label>
            <Input
              id="phone"
              value={settings.company_data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="email">E-mail</label>
            <Input
              id="email"
              type="email"
              value={settings.company_data.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label>Logo da Empresa</label>
            <FileUploader
              bucketName="store-logos"
              accept={{
                'image/*': ['.png', '.jpeg', '.jpg', '.gif', '.webp', '.svg']
              }}
              onUploadComplete={(url: string) => {
                handleChange('logo_url', url);
              }}
              defaultPreview={settings.company_data.logo_url}
            />
          </div>
        </div>

        <Button onClick={onSave}>Salvar Alterações</Button>
      </CardContent>
    </Card>
  );
}; 