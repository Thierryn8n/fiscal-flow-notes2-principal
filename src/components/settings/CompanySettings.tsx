import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CompanySettingsProps {
  settings: {
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
  };
  setSettings: (settings: any) => void;
  onSave: () => void;
}

export function CompanySettings({ settings, setSettings, onSave }: CompanySettingsProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('O logo deve ter no máximo 2MB.');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateCompanyData = (field: string, value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      company_data: {
        ...prev.company_data,
        [field]: value
      }
    }));
  };

  const updateAddress = (field: string, value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      company_data: {
        ...prev.company_data,
        address: {
          ...prev.company_data.address,
          [field]: value
        }
      }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da Empresa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company-name">Nome da Empresa</Label>
          <Input
            id="company-name"
            value={settings.company_data.name}
            onChange={(e) => updateCompanyData('name', e.target.value)}
            placeholder="Nome da sua empresa"
          />
        </div>

        <div className="space-y-2">
          <Label>Logo da Empresa</Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={logoPreview || settings.company_data.logo} />
              <AvatarFallback>Logo</AvatarFallback>
            </Avatar>
            <Input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="max-w-[300px]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="street">Rua</Label>
          <Input
            id="street"
            value={settings.company_data.address?.street || ''}
            onChange={(e) => updateAddress('street', e.target.value)}
            placeholder="Rua"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="number">Número</Label>
            <Input
              id="number"
              value={settings.company_data.address?.number || ''}
              onChange={(e) => updateAddress('number', e.target.value)}
              placeholder="Número"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={settings.company_data.address?.city || ''}
              onChange={(e) => updateAddress('city', e.target.value)}
              placeholder="Cidade"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              value={settings.company_data.address?.state || ''}
              onChange={(e) => updateAddress('state', e.target.value)}
              placeholder="Estado"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">CEP</Label>
            <Input
              id="zipCode"
              value={settings.company_data.address?.zipCode || ''}
              onChange={(e) => updateAddress('zipCode', e.target.value)}
              placeholder="CEP"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave}>Salvar</Button>
        </div>
      </CardContent>
    </Card>
  );
} 