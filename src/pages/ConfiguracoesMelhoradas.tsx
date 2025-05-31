import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Printer, 
  Download, 
  Save, 
  Copy,
  User,
  CreditCard,
  Plus,
  Trash2,
  Upload,
  Truck,
  Briefcase
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';

import {
  loadSettings as loadSupabaseSettings,
  saveSettings as saveSupabaseSettings,
  uploadCompanyLogo as uploadSupabaseCompanyLogo,
  removeCompanyLogo as removeSupabaseCompanyLogo,
  UserSettings as SupabaseUserSettings,
  CompanyData as SupabaseCompanyData,
  InstallmentFee as SupabaseInstallmentFee,
  DeliverySettings as SupabaseDeliverySettings,
  DeliveryRadius as SupabaseDeliveryRadius,
  PrinterSettings as SupabasePrinterSettings
} from '@/lib/supabaseSettings';

// Local interface for installment fees (with local ID for UI management)
interface LocalInstallmentFee {
  id: string;
  installments: number;
  fee: number;
}

// Local interface for company data
interface LocalCompanyData {
  name: string;
  cnpj: string;
  address: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  logo_url?: string;
  logo_path?: string;
}

// Local interface for delivery radiuses
interface LocalDeliveryRadius {
  id: string;
  radius: number;
  price: number;
  color: string;
}

const SettingsNew = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");

  // Installment Fees State
  const [installmentFees, setInstallmentFees] = useState<LocalInstallmentFee[]>([]);
  const [newInstallment, setNewInstallment] = useState<number>(2);
  const [newFee, setNewFee] = useState<number>(0);
  
  // Company Data State
  const [companyData, setCompanyData] = useState<LocalCompanyData>({
    name: '',
    cnpj: '',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: ''
  });

  // Delivery Radiuses State
  const [deliveryRadiuses, setDeliveryRadiuses] = useState<LocalDeliveryRadius[]>([]);
  const [newRadius, setNewRadius] = useState<number>(2);
  const [newPrice, setNewPrice] = useState<number>(5);
  const [selectedColor, setSelectedColor] = useState<string>('#FF9800');

  // --- Se necessário, carregue dados quando iniciar ---
  useEffect(() => {
    if (user) {
      // Aqui você pode carregar dados do Supabase
    }
  }, [user]);
  
  // --- Save Settings ---
  const handleSaveSettings = async () => {
    // Implemente a lógica para salvar configurações aqui
    toast({ title: "Configurações salvas", description: "Suas configurações foram salvas com sucesso" });
  };

  // FUNÇÃO SEGURA: Adicionar Taxas de Parcelamento (sem refresh)
  const handleAddInstallment = (e: React.MouseEvent) => {
    // Prevenção agressiva de eventos
    e.preventDefault(); 
    e.stopPropagation();
    
    if (newInstallment < 2) return;
    
    // Adiciona a taxa na lista
    const newFeeItem = { 
      id: uuidv4(), 
      installments: newInstallment, 
      fee: newFee 
    };
    
    setInstallmentFees(prev => [...prev, newFeeItem]);
    setNewInstallment(2);
    setNewFee(0);
    
    toast({ 
      title: 'Taxa adicionada',
      description: `Taxa de ${newFee}% para ${newInstallment}x adicionada.`
    });
    
    return false;
  };

  // FUNÇÃO SEGURA: Remover taxa
  const handleRemoveFee = (id: string) => {
    setInstallmentFees(prev => prev.filter(fee => fee.id !== id));
  };

  // FUNÇÃO SEGURA: Adicionar Raio de Entrega (sem refresh)
  const handleAddRadius = (e: React.MouseEvent) => {
    // Prevenção agressiva de eventos
    e.preventDefault();
    e.stopPropagation();
    
    if (newRadius <= 0) return;
    
    // Adiciona o raio na lista
    const newRadiusItem = {
      id: uuidv4(),
      radius: newRadius,
      price: newPrice,
      color: selectedColor
    };
    
    setDeliveryRadiuses(prev => [...prev, newRadiusItem]);
    setNewRadius(2);
    setNewPrice(5);
    
    toast({
      title: 'Raio adicionado',
      description: `Raio de ${newRadius}km adicionado com valor R$${newPrice}`
    });
    
    return false;
  };

  // FUNÇÃO SEGURA: Remover raio
  const handleRemoveRadius = (id: string) => {
    setDeliveryRadiuses(prev => prev.filter(radius => radius.id !== id));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6 pb-10 max-w-3xl mx-auto">
          {/* Cabeçalho */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold flex items-center">
                <SettingsIcon size={28} className="mr-3 text-green-600" />
                Configurações Melhoradas
              </h1>
              <Button 
                type="button"
                onClick={handleSaveSettings} 
                className="bg-green-600 hover:bg-green-700"
              >
                <Save size={18} className="mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </div>
          
          {/* Dados da Empresa */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold flex items-center">
                <Briefcase size={20} className="mr-3 text-green-600" />
                Dados da Empresa
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                  <input
                    type="text"
                    value={companyData.name}
                    onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={companyData.cnpj}
                    onChange={(e) => setCompanyData({...companyData, cnpj: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Taxas de Parcelamento */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold flex items-center">
                <CreditCard size={20} className="mr-3 text-green-600" />
                Taxas de Parcelamento
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {/* Lista de taxas existentes */}
              {installmentFees.length === 0 ? (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Nenhuma taxa configurada.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {installmentFees.map(fee => (
                    <div key={fee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>{fee.installments}x: {fee.fee}%</span>
                      <button 
                        type="button"
                        onClick={() => handleRemoveFee(fee.id)}
                        className="text-gray-500 hover:text-red-600 p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Formulário para adicionar nova taxa */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parcelas</label>
                    <input
                      type="number"
                      min="2"
                      value={newInstallment}
                      onChange={(e) => setNewInstallment(parseInt(e.target.value))}
                      className="w-24 px-3 py-2 rounded-lg border-2 border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taxa (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newFee}
                      onChange={(e) => setNewFee(parseFloat(e.target.value))}
                      className="w-24 px-3 py-2 rounded-lg border-2 border-gray-300"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleAddInstallment}
                      className="bg-green-600 hover:bg-green-700 h-10"
                    >
                      <Plus size={18} className="mr-2" />
                      Adicionar Taxa
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsNew;
