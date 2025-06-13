import { UserSettings } from '@/types/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DeliverySettingsProps {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  onSave: () => void;
}

export const DeliverySettings = ({ settings, setSettings, onSave }: DeliverySettingsProps) => {
  const addDeliveryRadius = () => {
    setSettings({
      ...settings,
      delivery_settings: {
        delivery_radii: [
          ...settings.delivery_settings.delivery_radii,
          {
            id: crypto.randomUUID(),
            radius: 0,
            fee: 0,
            center: {
              lat: 0,
              lng: 0
            }
          }
        ]
      }
    });
  };

  const updateDeliveryRadius = (index: number, field: keyof typeof settings.delivery_settings.delivery_radii[0], value: number) => {
    const newDeliveryRadii = [...settings.delivery_settings.delivery_radii];
    newDeliveryRadii[index] = {
      ...newDeliveryRadii[index],
      [field]: value
    };

    setSettings({
      ...settings,
      delivery_settings: {
        delivery_radii: newDeliveryRadii
      }
    });
  };

  const removeDeliveryRadius = (index: number) => {
    const newDeliveryRadii = settings.delivery_settings.delivery_radii.filter((_, i) => i !== index);
    setSettings({
      ...settings,
      delivery_settings: {
        delivery_radii: newDeliveryRadii
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Entrega</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {settings.delivery_settings.delivery_radii.map((radius, index) => (
            <div key={radius.id} className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor={`radius-${index}`}>Raio de Entrega (km)</label>
                <Input
                  id={`radius-${index}`}
                  type="number"
                  value={radius.radius}
                  onChange={(e) => updateDeliveryRadius(index, 'radius', parseFloat(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor={`fee-${index}`}>Taxa de Entrega (R$)</label>
                <Input
                  id={`fee-${index}`}
                  type="number"
                  value={radius.fee}
                  onChange={(e) => updateDeliveryRadius(index, 'fee', parseFloat(e.target.value))}
                />
              </div>
              <Button
                variant="destructive"
                onClick={() => removeDeliveryRadius(index)}
                className="col-span-2"
              >
                Remover
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button onClick={addDeliveryRadius}>Adicionar Raio de Entrega</Button>
          <Button onClick={onSave}>Salvar Alterações</Button>
        </div>
      </CardContent>
    </Card>
  );
}; 