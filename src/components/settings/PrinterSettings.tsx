import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface PrinterSettingsProps {
  settings: {
    printer_settings: {
      enabled: boolean;
      default_printer?: string;
      auto_print: boolean;
      copies: number;
    };
  };
  setSettings: (settings: any) => void;
  onSave: () => void;
}

export function PrinterSettings({ settings, setSettings, onSave }: PrinterSettingsProps) {
  const updatePrinterSettings = (field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      printer_settings: {
        ...prev.printer_settings,
        [field]: value
      }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Impressão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="printer-enabled">Ativar Impressão</Label>
          <Switch
            id="printer-enabled"
            checked={settings.printer_settings.enabled}
            onCheckedChange={(checked) => updatePrinterSettings('enabled', checked)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="default-printer">Impressora Padrão</Label>
          <Input
            id="default-printer"
            value={settings.printer_settings.default_printer || ''}
            onChange={(e) => updatePrinterSettings('default_printer', e.target.value)}
            placeholder="Nome da impressora padrão"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="auto-print">Impressão Automática</Label>
          <Switch
            id="auto-print"
            checked={settings.printer_settings.auto_print}
            onCheckedChange={(checked) => updatePrinterSettings('auto_print', checked)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="copies">Número de Cópias</Label>
          <Input
            id="copies"
            type="number"
            min={1}
            value={settings.printer_settings.copies}
            onChange={(e) => updatePrinterSettings('copies', parseInt(e.target.value))}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave}>Salvar</Button>
        </div>
      </CardContent>
    </Card>
  );
} 