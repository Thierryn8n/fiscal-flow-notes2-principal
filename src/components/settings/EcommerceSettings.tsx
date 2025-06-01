import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface EcommerceSettingsProps {
  settings: {
    ecommerce_settings: {
      enabled: boolean;
      admin_panel_enabled: boolean;
    };
  };
  setSettings: (settings: any) => void;
  onSave: () => void;
}

export function EcommerceSettings({ settings, setSettings, onSave }: EcommerceSettingsProps) {
  const updateEcommerceSettings = (field: string, value: boolean) => {
    setSettings((prev: any) => ({
      ...prev,
      ecommerce_settings: {
        ...prev.ecommerce_settings,
        [field]: value
      }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do E-commerce</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="ecommerce-enabled">Ativar E-commerce</Label>
          <Switch
            id="ecommerce-enabled"
            checked={settings.ecommerce_settings.enabled}
            onCheckedChange={(checked) => updateEcommerceSettings('enabled', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="admin-panel-enabled">Ativar Painel Administrativo</Label>
          <Switch
            id="admin-panel-enabled"
            checked={settings.ecommerce_settings.admin_panel_enabled}
            onCheckedChange={(checked) => updateEcommerceSettings('admin_panel_enabled', checked)}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave}>Salvar</Button>
        </div>
      </CardContent>
    </Card>
  );
} 