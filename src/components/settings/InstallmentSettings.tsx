import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { UserSettings } from '@/types/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';

interface InstallmentSettingsProps {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  onSave: () => void;
}

export const InstallmentSettings = ({ settings, setSettings, onSave }: InstallmentSettingsProps) => {
  const addInstallmentFee = () => {
    setSettings({
      ...settings,
      installment_fees: [
        ...settings.installment_fees,
        {
          installments: 2,
          fee_percentage: 0
        }
      ]
    });
  };

  const updateInstallmentFee = (index: number, field: keyof typeof settings.installment_fees[0], value: number) => {
    const newInstallmentFees = [...settings.installment_fees];
    newInstallmentFees[index] = {
      ...newInstallmentFees[index],
      [field]: value
    };

    setSettings({
      ...settings,
      installment_fees: newInstallmentFees
    });
  };

  const removeInstallmentFee = (index: number) => {
    const newInstallmentFees = settings.installment_fees.filter((_, i) => i !== index);
    setSettings({
      ...settings,
      installment_fees: newInstallmentFees
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Parcelamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {settings.installment_fees.map((fee, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor={`installments-${index}`}>Número de Parcelas</label>
                <Input
                  id={`installments-${index}`}
                  type="number"
                  min={2}
                  value={fee.installments}
                  onChange={(e) => updateInstallmentFee(index, 'installments', parseInt(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor={`fee-${index}`}>Taxa de Juros (%)</label>
                <Input
                  id={`fee-${index}`}
                  type="number"
                  min={0}
                  step={0.1}
                  value={fee.fee_percentage}
                  onChange={(e) => updateInstallmentFee(index, 'fee_percentage', parseFloat(e.target.value))}
                />
              </div>
              <Button
                variant="destructive"
                onClick={() => removeInstallmentFee(index)}
                className="col-span-2"
              >
                Remover
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button onClick={addInstallmentFee}>Adicionar Taxa de Parcelamento</Button>
          <Button onClick={onSave}>Salvar Alterações</Button>
        </div>
      </CardContent>
    </Card>
  );
}; 