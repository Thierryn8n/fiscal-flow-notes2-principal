import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Printer, Settings } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getPrinters, PrinterInfo } from '@/integrations/printer/printer-bridge';

interface PrinterSettingsProps {
  onSettingsChange?: (settings: PrinterConfiguration) => void;
}

interface PrinterConfiguration {
  fiscalNotePrinter: string;
  normalPrinter: string;
}

export function PrinterSettings({ onSettingsChange }: PrinterSettingsProps) {
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [fiscalNotePrinter, setFiscalNotePrinter] = useState<string>('none');
  const [normalPrinter, setNormalPrinter] = useState<string>('none');
  const [loading, setLoading] = useState(false);

  // Descobrir impressoras do sistema
  const discoverPrinters = async () => {
    setLoading(true);
    try {
      const systemPrinters = await getPrinters();
      setPrinters(systemPrinters);
      
      // Se encontrar uma impressora padrão, configura como impressora normal
      const defaultPrinter = systemPrinters.find((printer: PrinterInfo) => printer.isDefault);
      if (defaultPrinter && normalPrinter === 'none') {
        setNormalPrinter(defaultPrinter.name);
      }

      toast({
        title: "Impressoras descobertas",
        description: `${systemPrinters.length} impressoras encontradas`,
      });
    } catch (error) {
      console.error('Erro ao descobrir impressoras:', error);
      toast({
        title: "Erro",
        description: "Falha ao descobrir impressoras do sistema",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = () => {
    const settings: PrinterConfiguration = {
      fiscalNotePrinter: fiscalNotePrinter === 'none' ? '' : fiscalNotePrinter,
      normalPrinter: normalPrinter === 'none' ? '' : normalPrinter
    };
    
    // Salvar no localStorage
    localStorage.setItem('printerSettings', JSON.stringify(settings));
    
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
    
    toast({
      title: "Configurações salvas",
      description: "Configurações de impressora foram salvas com sucesso",
    });
  };

  // Carregar configurações salvas e descobrir impressoras ao montar
  useEffect(() => {
    const savedSettings = localStorage.getItem('printerSettings');
    if (savedSettings) {
      const settings: PrinterConfiguration = JSON.parse(savedSettings);
      setFiscalNotePrinter(settings.fiscalNotePrinter || 'none');
      setNormalPrinter(settings.normalPrinter || 'none');
    }
    
    // Descobrir impressoras automaticamente ao carregar
    discoverPrinters();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configurações de Impressoras
        </CardTitle>
        <CardDescription>
          Configure diferentes impressoras para notas fiscais e impressões normais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {printers.length} impressoras disponíveis
          </span>
          <Button 
            onClick={discoverPrinters} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? 'Procurando...' : 'Buscar Impressoras'}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fiscal-printer" className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Impressora para Notas Fiscais
            </Label>
            <Select value={fiscalNotePrinter} onValueChange={setFiscalNotePrinter}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma impressora para notas fiscais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma selecionada</SelectItem>
                {printers.map((printer) => (
                  <SelectItem key={printer.name} value={printer.name}>
                    {printer.name} {printer.isDefault ? '(Padrão)' : ''} 
                    {printer.status !== 'READY' && ` - ${printer.status}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fiscalNotePrinter && fiscalNotePrinter !== 'none' && (
              <p className="text-xs text-green-600">
                ✓ {fiscalNotePrinter}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="normal-printer" className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Impressora Normal (Auto-impressão)
            </Label>
            <Select value={normalPrinter} onValueChange={setNormalPrinter}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma impressora normal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma selecionada</SelectItem>
                {printers.map((printer) => (
                  <SelectItem key={printer.name} value={printer.name}>
                    {printer.name} {printer.isDefault ? '(Padrão)' : ''}
                    {printer.status !== 'READY' && ` - ${printer.status}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {normalPrinter && normalPrinter !== 'none' && (
              <p className="text-xs text-green-600">
                ✓ {normalPrinter}
              </p>
            )}
          </div>
        </div>

        <Button 
          onClick={handleSaveSettings}
          disabled={fiscalNotePrinter === 'none' && normalPrinter === 'none'}
          className="w-full"
        >
          Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  );
}
