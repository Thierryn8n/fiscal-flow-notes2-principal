import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { SettingsService } from '@/services/settings.service';
import { UserSettings, CompanyData, InstallmentFee, DeliveryRadius, PrinterSettings, EcommerceSettings } from '@/types/settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Trash2, Save, Building, CreditCard, MapPin, Printer, Info } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const defaultSettings: UserSettings = {
  company_data: {
    name: '',
    cnpj: '',
    address: '',
    phone: '',
    email: '',
    logo: ''
  },
  installment_fees: [],
  delivery_settings: {
    delivery_radii: [],
    default_delivery_fee: 0
  },
  printer_settings: {
    default_printer: '',
    auto_print: false,
  },
  ecommerce_settings: {
    enabled: false,
    admin_panel_enabled: false,
  },
};

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const userSettings = await SettingsService.getUserSettings();
        if (userSettings) {
          setSettings(userSettings);
          if (userSettings.company_data.logo) {
            setLogoPreview(userSettings.company_data.logo);
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast({
          title: "Erro ao carregar configurações",
          description: "Não foi possível carregar suas configurações. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      let updatedSettings = { ...settings };

      if (logoFile) {
        const logoUrl = await SettingsService.uploadCompanyLogo(logoFile);
        if (logoUrl) {
          updatedSettings.company_data.logo = logoUrl;
        } else {
          toast({
            title: "Erro no Upload",
            description: "Não foi possível fazer upload do logo. Tente um arquivo menor ou formato diferente.",
            variant: "destructive",
          });
        }
      }

      const existingSettings = await SettingsService.getUserSettings();
      let result;
      if (existingSettings && existingSettings.id) {
        result = await SettingsService.updateUserSettings(updatedSettings);
      } else {
        result = await SettingsService.createUserSettings(updatedSettings);
      }

      if (result) {
        setSettings(result);
        toast({
          title: "Configurações salvas",
          description: "Suas configurações foram salvas com sucesso.",
        });
      } else {
         toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar suas configurações. Verifique os dados e tente novamente.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Erro Crítico ao Salvar",
        description: "Ocorreu um erro inesperado. Contate o suporte.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "Arquivo Muito Grande",
          description: "O logo deve ter no máximo 2MB.",
          variant: "destructive",
        });
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

  const addInstallmentFee = () => {
    setSettings(prev => ({
      ...prev,
      installment_fees: [
        ...prev.installment_fees,
        { installments: 2, fee: 0 }
      ]
    }));
  };

  const updateInstallmentFee = (index: number, field: keyof InstallmentFee, value: string | number) => {
    const parsedValue = typeof value === 'string' ? (field === 'fee' ? parseFloat(value) : parseInt(value)) : value;
    const newFees = [...settings.installment_fees];
    newFees[index] = { ...newFees[index], [field]: parsedValue };
    setSettings({ ...settings, installment_fees: newFees });
  };

  const removeInstallmentFee = (index: number) => {
    const newFees = settings.installment_fees.filter((_, i) => i !== index);
    setSettings({ ...settings, installment_fees: newFees });
  };

  const addDeliveryRadius = () => {
    setSettings(prev => ({
      ...prev,
      delivery_settings: {
        ...prev.delivery_settings,
        delivery_radii: [
          ...prev.delivery_settings.delivery_radii,
          { radius: 0, fee: 0 }
        ]
      }
    }));
  };

  const updateDeliveryRadius = (index: number, field: keyof DeliveryRadius, value: string | number) => {
    const parsedValue = typeof value === 'string' ? parseFloat(value) : value;
    const newRadii = [...settings.delivery_settings.delivery_radii];
    newRadii[index] = { ...newRadii[index], [field]: parsedValue };
    setSettings(prev => ({ ...prev, delivery_settings: { ...prev.delivery_settings, delivery_radii: newRadii }}));
  };

  const removeDeliveryRadius = (index: number) => {
    const newRadii = settings.delivery_settings.delivery_radii.filter((_, i) => i !== index);
    setSettings(prev => ({ ...prev, delivery_settings: { ...prev.delivery_settings, delivery_radii: newRadii }}));
  };

  const updateCompanyData = (field: keyof CompanyData, value: string) => {
    setSettings(prev => ({
      ...prev,
      company_data: {
        ...prev.company_data,
        [field]: value
      }
    }));
  };

  const updatePrinterSettings = (field: keyof PrinterSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      printer_settings: {
        ...prev.printer_settings,
        [field]: value
      }
    }));
  };

  const updateEcommerceSettings = (field: keyof EcommerceSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      ecommerce_settings: {
        ...(prev.ecommerce_settings || { enabled: false, admin_panel_enabled: false }),
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Gerencie as configurações do seu sistema</p>
        </div>

        <Tabs defaultValue="company" className="w-full">
          <div className="mb-6">
            <TabsList className="!bg-white p-[5px] rounded-[20px] border border-gray-300 w-full flex justify-between">
              <TabsTrigger 
                value="company" 
                className="data-[state=active]:bg-fiscal-green-50 data-[state=active]:text-fiscal-green-700 data-[state=active]:font-medium data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-fiscal-green-300 bg-slate-50 transition-all duration-200 rounded-xl mx-0.5 border border-transparent hover:border-gray-200 text-sm flex items-center justify-center gap-1.5 py-2 flex-1 whitespace-nowrap"
              >
                <Building size={16} />
                <span className="hidden sm:inline">Empresa</span>
              </TabsTrigger>
              <TabsTrigger 
                value="payment" 
                className="data-[state=active]:bg-fiscal-green-50 data-[state=active]:text-fiscal-green-700 data-[state=active]:font-medium data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-fiscal-green-300 bg-slate-50 transition-all duration-200 rounded-xl mx-0.5 border border-transparent hover:border-gray-200 text-sm flex items-center justify-center gap-1.5 py-2 flex-1 whitespace-nowrap"
              >
                <CreditCard size={16} />
                <span className="hidden sm:inline">Pagamento</span>
              </TabsTrigger>
              <TabsTrigger 
                value="delivery" 
                className="data-[state=active]:bg-fiscal-green-50 data-[state=active]:text-fiscal-green-700 data-[state=active]:font-medium data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-fiscal-green-300 bg-slate-50 transition-all duration-200 rounded-xl mx-0.5 border border-transparent hover:border-gray-200 text-sm flex items-center justify-center gap-1.5 py-2 flex-1 whitespace-nowrap"
              >
                <MapPin size={16} />
                <span className="hidden sm:inline">Entrega</span>
              </TabsTrigger>
              <TabsTrigger 
                value="printer" 
                className="data-[state=active]:bg-fiscal-green-50 data-[state=active]:text-fiscal-green-700 data-[state=active]:font-medium data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-fiscal-green-300 bg-slate-50 transition-all duration-200 rounded-xl mx-0.5 border border-transparent hover:border-gray-200 text-sm flex items-center justify-center gap-1.5 py-2 flex-1 whitespace-nowrap"
              >
                <Printer size={16} />
                <span className="hidden sm:inline">Impressora</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ecommerce" 
                className="data-[state=active]:bg-fiscal-green-50 data-[state=active]:text-fiscal-green-700 data-[state=active]:font-medium data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-fiscal-green-300 bg-slate-50 transition-all duration-200 rounded-xl mx-0.5 border border-transparent hover:border-gray-200 text-sm flex items-center justify-center gap-1.5 py-2 flex-1 whitespace-nowrap"
              >
                <Info size={16} />
                <span className="hidden sm:inline">E-commerce</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Empresa</CardTitle>
                <CardDescription>Configure as informações da sua empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                    <Label htmlFor="company-cnpj">CNPJ</Label>
                    <Input
                      id="company-cnpj"
                      value={settings.company_data.cnpj}
                      onChange={(e) => updateCompanyData('cnpj', e.target.value)}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-address">Endereço</Label>
                  <Input
                    id="company-address"
                    value={settings.company_data.address}
                    onChange={(e) => updateCompanyData('address', e.target.value)}
                    placeholder="Endereço completo"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Telefone</Label>
                    <Input
                      id="company-phone"
                      value={settings.company_data.phone}
                      onChange={(e) => updateCompanyData('phone', e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-email">E-mail</Label>
                    <Input
                      id="company-email"
                      value={settings.company_data.email}
                      onChange={(e) => updateCompanyData('email', e.target.value)}
                      placeholder="contato@empresa.com"
                      type="email"
                    />
                  </div>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Taxas de Parcelamento</CardTitle>
                <CardDescription>Configure as taxas para cada número de parcelas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {settings.installment_fees.map((fee, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
                      <div className="w-full sm:w-1/3">
                        <Label>Parcelas</Label>
                        <Input
                          type="number"
                          min="2"
                          value={fee.installments}
                          onChange={(e) => updateInstallmentFee(index, 'installments', e.target.value)}
                        />
                      </div>
                      <div className="w-full sm:w-1/3">
                        <Label>Taxa (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={fee.fee}
                          onChange={(e) => updateInstallmentFee(index, 'fee', e.target.value)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-100 p-2 rounded-md h-10 w-10 flex items-center justify-center"
                        onClick={() => removeInstallmentFee(index)}
                        aria-label="Remover taxa"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    onClick={addInstallmentFee} 
                    variant="outline" 
                    className="w-full mt-5 py-2.5 border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition duration-150 ease-in-out"
                  >
                    <PlusCircle size={18} />
                    Adicionar Nova Taxa de Parcelamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Entrega</CardTitle>
                <CardDescription>Configure as taxas de entrega por raio de distância</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Taxa de Entrega Padrão</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.delivery_settings.default_delivery_fee}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        delivery_settings: {
                          ...prev.delivery_settings,
                          default_delivery_fee: parseFloat(e.target.value)
                        }
                      }))}
                    />
                  </div>

                  <div className="space-y-4">
                    {settings.delivery_settings.delivery_radii.map((radius, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
                        <div className="w-full sm:w-1/3">
                          <Label>Raio (km)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={radius.radius}
                            onChange={(e) => updateDeliveryRadius(index, 'radius', e.target.value)}
                          />
                        </div>
                        <div className="w-full sm:w-1/3">
                          <Label>Taxa (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={radius.fee}
                            onChange={(e) => updateDeliveryRadius(index, 'fee', e.target.value)}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-100 p-2 rounded-md h-10 w-10 flex items-center justify-center"
                          onClick={() => removeDeliveryRadius(index)}
                          aria-label="Remover raio de entrega"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      onClick={addDeliveryRadius} 
                      variant="outline" 
                      className="w-full mt-5 py-2.5 border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition duration-150 ease-in-out"
                    >
                      <PlusCircle size={18} />
                      Adicionar Novo Raio de Entrega
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="printer">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Impressão</CardTitle>
                <CardDescription>Configure as opções de impressão</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-print">Impressão Automática</Label>
                    <Switch
                      id="auto-print"
                      checked={settings.printer_settings.auto_print}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        printer_settings: {
                          ...prev.printer_settings,
                          auto_print: checked
                        }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ecommerce">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do E-commerce</CardTitle>
                <CardDescription>Configure as opções do seu e-commerce</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 sm:mt-8 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="bg-fiscal-green-600 hover:bg-fiscal-green-700 text-white font-medium px-6 py-2 rounded-xl flex items-center gap-2 text-sm transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span>
            ) : (
              <Save size={16} className="text-white" />
            )}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </Layout>
  );
} 