import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, Check, Search, UserRound, MapPinned, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';
import { CustomersService } from '@/services/customersService';
import { CustomerAddress, CustomerFormData, mapCustomerToForm } from '@/types/Customer';
import { useAuth } from '@/contexts/AuthContext';

// Importações adicionais para o Dialog
import * as Dialog from '@radix-ui/react-dialog';

export interface CustomerData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: CustomerAddress;
  owner_id?: string;
}

interface CustomerFormProps {
  initialCustomer?: CustomerFormData;
  onCustomerSelect?: (customer: CustomerFormData) => void;
  onSave?: (customer: CustomerFormData) => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  initialCustomer,
  onCustomerSelect,
  onSave
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isMobile } = useDeviceDetect();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerFormData | null>(null);
  const [customerData, setCustomerData] = useState<CustomerFormData>(
    initialCustomer || {
    name: '',
      email: '',
      phone: '',
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      }
    }
  );
  
  // Carregar cliente inicial se fornecido
  useEffect(() => {
    if (initialCustomer) {
      setCustomerData(initialCustomer);
      setSelectedCustomer(initialCustomer);
    }
  }, [initialCustomer]);

  // Função para buscar clientes
  const searchCustomers = async (term: string) => {
    if (!term) return;
    
    try {
      setIsLoading(true);
      const customers = await CustomersService.searchCustomers(term);
      
      if (customers.length > 0) {
        // Mapear os clientes para o formato esperado
        const mappedCustomers = customers.map(customer => ({
          id: customer.id,
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone,
          address: customer.address as CustomerFormData['address'],
          owner_id: customer.owner_id
        }));

        // Mostrar resultados em um toast
        toast({
          title: `${customers.length} cliente(s) encontrado(s)`,
          description: "Selecione um cliente da lista",
          variant: "success"
        });
        
        return mappedCustomers;
      } else {
        toast({
          title: "Nenhum cliente encontrado",
          description: "Tente outro termo de busca ou cadastre um novo cliente",
          variant: "warning"
        });
        return [];
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: "Erro ao buscar clientes",
        description: "Tente novamente mais tarde",
        variant: "error"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar clientes",
        variant: "error"
      });
      return;
    }
    
    try {
      setIsLoading(true);

      // Preparar dados do cliente
      const customerToSave = {
        ...customerData,
        owner_id: user.id
      };
      
      // Salvar cliente
      const savedCustomer = await CustomersService.saveCustomer(customerToSave);
      
      // Mapear o cliente salvo para o formato do formulário
      const mappedCustomer = mapCustomerToForm(savedCustomer);
        
      // Atualizar estado local
      setCustomerData(mappedCustomer);
        
      // Notificar componente pai
      if (onCustomerSelect) {
        onCustomerSelect(mappedCustomer);
    }

      // Chamar callback de salvamento se existir
      if (onSave) {
        onSave(mappedCustomer);
    }

      toast({
        title: "Cliente salvo com sucesso",
        variant: "success"
      });

    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast({
        title: "Erro ao salvar cliente",
        description: "Tente novamente mais tarde",
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para selecionar um cliente
  const handleCustomerSelect = (customer: CustomerFormData) => {
    setSelectedCustomer(customer);
    setCustomerData(customer);
    if (onCustomerSelect) {
      onCustomerSelect(customer);
    }
  };
  
  // Função para atualizar campos do endereço
  const handleAddressChange = (field: keyof CustomerAddress, value: string) => {
    setCustomerData((prev: CustomerFormData) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  return (
    <div className={`${isMobile ? '' : 'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'}`}>
      {/* Header com gradiente */}
      {!isMobile && (
        <div className="bg-gradient-to-r from-fiscal-green-500 to-fiscal-green-600 p-5 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mr-3">
                <User size={20} className="text-white" />
              </span>
              <h3 className="text-lg font-cascadia text-white">Dados do Cliente</h3>
            </div>
        
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="pl-9 pr-5 py-2.5 rounded-xl bg-white drop-shadow-md border-2 border-fiscal-green-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-fiscal-green-400 focus:ring-opacity-60 transition-all cursor-pointer hover:bg-fiscal-green-50 hover:border-fiscal-green-300 hover:shadow-md active:scale-95 flex items-center group animate-pulse hover:animate-none">
                  <div className="absolute left-2.5 w-6 h-6 flex items-center justify-center bg-fiscal-green-500 group-hover:bg-fiscal-green-600 text-white rounded-full transition-all">
                    <Search size={14} />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-900">Selecionar cliente...</span>
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 animate-in fade-in" />
                <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] bg-white rounded-xl shadow-lg z-50 border border-gray-200 p-0 overflow-hidden animate-in fade-in-90 zoom-in-90">
                  <div className="bg-gradient-to-r from-fiscal-green-500 to-fiscal-green-600 p-4 flex items-center justify-between">
                    <h3 className="text-lg font-cascadia text-white flex items-center">
                      <UserRound size={18} className="mr-2" />
                      Selecionar Cliente
                    </h3>
                    <Dialog.Close asChild>
                      <button className="text-white hover:bg-white/20 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-white">
                        <X size={20} />
                      </button>
                    </Dialog.Close>
                  </div>
                  
                  <div className="p-4">
                    <div className="relative mb-4">
                      <input
                        type="text"
                        placeholder="Buscar cliente por nome ou telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-fiscal-green-500 focus:border-fiscal-green-500 transition-colors shadow-sm bg-gray-50 hover:bg-white focus:bg-white"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fiscal-green-500">
                        <Search size={16} />
                      </div>
                      {searchTerm && (
                        <button 
                          onClick={() => {
                            setSearchTerm('');
                            searchCustomers(searchTerm);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-[50vh] overflow-y-auto">
                      {isLoading ? (
                        <div className="flex justify-center items-center py-10">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fiscal-green-500"></div>
                          <span className="ml-2 text-gray-600">Carregando clientes...</span>
                        </div>
                      ) : selectedCustomer ? (
                        <div className="space-y-2">
                          <Dialog.Close asChild>
                              <button
                              onClick={() => handleCustomerSelect(selectedCustomer)}
                                className="w-full text-left p-3 rounded-lg hover:bg-fiscal-green-50 focus:bg-fiscal-green-50 focus:outline-none transition-all border border-gray-100 hover:border-fiscal-green-200 hover:shadow-sm group"
                              >
                                <div className="flex items-center">
                                  <div className="bg-fiscal-green-100 text-fiscal-green-600 p-2 rounded-full mr-3 group-hover:bg-fiscal-green-500 group-hover:text-white transition-all">
                                    <UserRound size={18} />
                                  </div>
                                  <div className="flex-1">
                                  <div className="font-medium group-hover:text-fiscal-green-700 transition-colors">{selectedCustomer.name}</div>
                                    <div className="text-sm text-gray-500 flex items-center">
                                    <Phone size={14} className="mr-1 opacity-70" /> {selectedCustomer.phone}
                                    </div>
                                  {selectedCustomer.address && selectedCustomer.address.city && (
                                      <div className="text-sm text-gray-500 flex items-center mt-1">
                                        <MapPin size={14} className="mr-1 opacity-70" /> 
                                      {selectedCustomer.address.city}
                                      {selectedCustomer.address.state && `, ${selectedCustomer.address.state}`}
                                      </div>
                                    )}
                                  </div>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-fiscal-green-100 text-fiscal-green-700 rounded-full p-1">
                                      <Check size={16} />
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </Dialog.Close>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <UserRound size={40} className="mx-auto mb-3 text-gray-300" />
                          <p className="text-gray-500">Nenhum cliente encontrado.</p>
                          <p className="text-gray-400 text-sm mt-1">Tente outro termo de busca ou cadastre um novo cliente.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      )}
      
      {/* Mobile header simplified */}
      {isMobile && (
        <div className="bg-fiscal-green-500 p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center">
            <User size={20} className="text-white mr-2" />
            <h3 className="text-white font-medium">Dados do Cliente</h3>
          </div>
          
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button className="bg-white px-3 py-1.5 rounded-lg text-fiscal-green-700 text-sm font-medium shadow-sm">
                Selecionar
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50" />
              <Dialog.Content className="fixed bottom-0 left-0 right-0 max-h-[80vh] bg-white rounded-t-xl shadow-lg z-50 border-t border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-fiscal-green-500 to-fiscal-green-600 p-3 flex items-center justify-between">
                  <h3 className="text-base font-medium text-white flex items-center">
                    <UserRound size={16} className="mr-2" />
                    Selecionar Cliente
                  </h3>
                  <Dialog.Close asChild>
                    <button className="text-white hover:bg-white/20 rounded-full p-1">
                      <X size={18} />
                    </button>
                  </Dialog.Close>
                </div>
                
                <div className="p-3">
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Buscar cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fiscal-green-500">
                      <Search size={14} />
                    </div>
                    {searchTerm && (
                      <button 
                        onClick={() => {
                          setSearchTerm('');
                          searchCustomers(searchTerm);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                      <div className="flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-fiscal-green-500"></div>
                        <span className="ml-2 text-gray-600 text-sm">Carregando...</span>
                      </div>
                    ) : selectedCustomer ? (
                      <div className="space-y-1.5">
                        <Dialog.Close asChild>
                            <button
                            onClick={() => handleCustomerSelect(selectedCustomer)}
                              className="w-full text-left p-2.5 rounded-lg bg-gray-50 hover:bg-fiscal-green-50 border border-gray-100 hover:border-fiscal-green-200 text-sm"
                            >
                              <div className="flex items-center">
                                <div className="flex-1">
                                <div className="font-medium">{selectedCustomer.name}</div>
                                  <div className="text-xs text-gray-500 flex items-center">
                                  <Phone size={12} className="mr-1" /> {selectedCustomer.phone}
                                  </div>
                                </div>
                                <Check size={16} className="text-fiscal-green-500" />
                              </div>
                            </button>
                          </Dialog.Close>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500 text-sm">Nenhum cliente encontrado.</p>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      )}
      
      {/* Info box */}
      <div className="bg-amber-50 text-amber-700 text-sm p-2.5 flex items-start border-b border-amber-100">
        <Search size={16} className="mr-2 flex-shrink-0 mt-0.5" />
        <span>Dica: Use o botão "Selecionar cliente" para buscar clientes já cadastrados</span>
      </div>

      {/* Form Content */}
      <div className="p-4">
        <div className="space-y-4">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center mb-1">
              <User size={14} className="mr-1.5" /> Nome Completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={customerData.name}
            onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nome completo do cliente"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-fiscal-green-500 focus:border-fiscal-green-500"
            required
          />
        </div>
        
          {/* Telefone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 flex items-center mb-1">
              <Phone size={14} className="mr-1.5" /> Telefone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={customerData.phone}
            onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="(00) 00000-0000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-fiscal-green-500 focus:border-fiscal-green-500"
              required
          />
        </div>
        
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center mb-1">
              <User size={14} className="mr-1.5" /> Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={customerData.email}
              onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="exemplo@exemplo.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-fiscal-green-500 focus:border-fiscal-green-500"
            />
          </div>
        
          {/* Endereço (opcional) */}
        <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <MapPinned size={14} className="mr-1.5" /> Endereço <span className="text-gray-400 text-xs ml-1">(opcional)</span>
              </label>
          </div>
          
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Rua */}
              <div>
                <label htmlFor="address.street" className="block text-xs text-gray-500 mb-1">
                  Rua
                </label>
            <input
              type="text"
              id="address.street"
              name="address.street"
              value={customerData.address?.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="Rua"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-fiscal-green-500 focus:border-fiscal-green-500"
            />
          </div>
              
              {/* Número */}
              <div>
                <label htmlFor="address.number" className="block text-xs text-gray-500 mb-1">
                  Número
                </label>
            <input
              type="text"
              id="address.number"
              name="address.number"
              value={customerData.address?.number}
              onChange={(e) => handleAddressChange('number', e.target.value)}
                  placeholder="N°"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-fiscal-green-500 focus:border-fiscal-green-500"
            />
          </div>
          
              {/* Bairro */}
          <div>
                <label htmlFor="address.neighborhood" className="block text-xs text-gray-500 mb-1">
                  Bairro
                </label>
            <input
              type="text"
              id="address.neighborhood"
              name="address.neighborhood"
              value={customerData.address?.neighborhood}
              onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
              placeholder="Bairro"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-fiscal-green-500 focus:border-fiscal-green-500"
            />
          </div>
              
              {/* CEP */}
          <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="address.zipCode" className="block text-xs text-gray-500 mb-1">
                    CEP
                  </label>
                </div>
                <div className="relative">
            <input
              type="text"
              id="address.zipCode"
              name="address.zipCode"
              value={customerData.address?.zipCode}
              onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  onBlur={(e) => {
                    if (e.target.value.length >= 8) {
                      searchCustomers(e.target.value);
                    }
                  }}
              placeholder="00000-000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-fiscal-green-500 focus:border-fiscal-green-500"
            />
            </div>
          </div>
          
              {/* Cidade */}
          <div>
                <label htmlFor="address.city" className="block text-xs text-gray-500 mb-1">
                  Cidade
                </label>
            <input
              type="text"
              id="address.city"
              name="address.city"
              value={customerData.address?.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              placeholder="Cidade"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-fiscal-green-500 focus:border-fiscal-green-500"
            />
              </div>
              
              {/* Estado */}
          <div>
                <label htmlFor="address.state" className="block text-xs text-gray-500 mb-1">
                  Estado
                </label>
            <input
              type="text"
              id="address.state"
              name="address.state"
              value={customerData.address?.state}
              onChange={(e) => handleAddressChange('state', e.target.value)}
                  placeholder="Estado"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-fiscal-green-500 focus:border-fiscal-green-500"
                />
              </div>
              </div>
            </div>
        </div>
      
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            onClick={handleSave}
            className="bg-fiscal-green-500 hover:bg-fiscal-green-600 text-white px-4 py-2 rounded-md flex items-center focus:outline-none focus:ring-2 focus:ring-fiscal-green-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
