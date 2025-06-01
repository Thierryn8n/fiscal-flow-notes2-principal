import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Users, Plus, Trash2, MapPin, Search, Phone, User, Save, X, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
}

const CustomerManagement: React.FC = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    name: '',
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
    },
    phone: '',
  });
  
  // Load customers from localStorage on component mount
  useEffect(() => {
    const storedCustomers = localStorage.getItem('customers');
    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers));
    }
  }, []);
  
  // Save customers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, string>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Generate a unique ID for a new customer
  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };
  
  // Add a new customer
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.phone) {
      toast({
        title: 'Dados incompletos',
        description: 'Por favor, preencha pelo menos o nome e telefone do cliente.',
        variant: 'destructive',
      });
      return;
    }
    
    // Add new customer
    const newCustomer: Customer = {
      id: generateUniqueId(),
      ...formData
    };
    
    setCustomers(prev => [...prev, newCustomer]);
    
    toast({
      title: 'Cliente adicionado',
      description: 'O cliente foi adicionado com sucesso.',
    });
    
    // Reset form
    setFormData({
      name: '',
      address: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
      },
      phone: '',
    });
    setIsFormOpen(false);
  };
  
  // Delete a customer
  const handleDeleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
    
    toast({
      title: 'Cliente removido',
      description: 'O cliente foi removido com sucesso.',
    });
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-4 animate-fadeIn px-2 sm:px-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
              <h2 className="text-xl sm:text-2xl font-cascadia mb-4 sm:mb-0 flex items-center">
                <span className="bg-fiscal-green-500 text-white p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 flex-shrink-0">
                  <Users size={18} className="sm:size-20" />
                </span>
                Gerenciamento de Clientes
              </h2>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className={`${isFormOpen ? 'btn-secondary' : 'btn-primary'} rounded-full flex items-center px-3 sm:px-5 py-2 text-sm sm:text-base`}
                >
                  {isFormOpen ? (
                    <>
                      <X size={16} className="mr-1 sm:mr-2" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="mr-1 sm:mr-2" />
                      Novo Cliente
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Add Customer Form */}
          {isFormOpen && (
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm mb-4 sm:mb-6 animate-fadeIn">
              <div className="flex items-center mb-4">
                <span className="bg-fiscal-green-500 text-white p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 flex-shrink-0">
                  <Plus size={16} className="sm:size-20" />
                </span>
                <h3 className="text-base sm:text-lg font-cascadia">Adicionar Novo Cliente</h3>
              </div>
              
              <form onSubmit={handleAddCustomer} className="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fiscal-green-500 focus:border-fiscal-green-500 transition-colors text-base"
                    placeholder="Nome completo do cliente"
                    required
                  />
                </div>
                
                <div className="mt-1 sm:mt-2">
                  <div className="flex items-center mb-2">
                    <MapPin size={16} className="text-gray-400 mr-1.5" />
                    <h4 className="text-sm font-medium text-gray-700">Endereço</h4>
                  </div>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
                        <input
                          type="text"
                          id="address.street"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fiscal-green-500 focus:border-fiscal-green-500 transition-colors text-base"
                          placeholder="Rua/Avenida"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address.number" className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                        <input
                          type="text"
                          id="address.number"
                          name="address.number"
                          value={formData.address.number}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fiscal-green-500 focus:border-fiscal-green-500 transition-colors text-base"
                          placeholder="Número"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                      <div>
                        <label htmlFor="address.neighborhood" className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                        <input
                          type="text"
                          id="address.neighborhood"
                          name="address.neighborhood"
                          value={formData.address.neighborhood}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fiscal-green-500 focus:border-fiscal-green-500 transition-colors text-base"
                          placeholder="Bairro"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                        <input
                          type="text"
                          id="address.city"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fiscal-green-500 focus:border-fiscal-green-500 transition-colors text-base"
                          placeholder="Cidade"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                      <div>
                        <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <input
                          type="text"
                          id="address.state"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fiscal-green-500 focus:border-fiscal-green-500 transition-colors text-base"
                          placeholder="Estado"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                        <input
                          type="text"
                          id="address.zipCode"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fiscal-green-500 focus:border-fiscal-green-500 transition-colors text-base"
                          placeholder="CEP"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fiscal-green-500 focus:border-fiscal-green-500 transition-colors text-base"
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-fiscal-green-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-fiscal-green-600 focus:outline-none focus:ring-2 focus:ring-fiscal-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
                >
                  <Save size={18} className="mr-2" />
                  Salvar Cliente
                </button>
              </form>
            </div>
          )}
          
          {/* Search and Customer List */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <Search size={16} className="text-gray-400 mr-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar clientes..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fiscal-green-500 focus:border-fiscal-green-500 transition-colors text-base"
              />
            </div>
            
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8">
                <Info size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Nenhum cliente encontrado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCustomers.map(customer => (
                  <div key={customer.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{customer.name}</h3>
                        <div className="mt-1 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Phone size={14} className="mr-1" />
                            {customer.phone}
                          </div>
                          {customer.address.street && (
                            <div className="flex items-center mt-1">
                              <MapPin size={14} className="mr-1" />
                              {customer.address.street}, {customer.address.number}
                              {customer.address.neighborhood && ` - ${customer.address.neighborhood}`}
                              {customer.address.city && `, ${customer.address.city}`}
                              {customer.address.state && ` - ${customer.address.state}`}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerManagement; 