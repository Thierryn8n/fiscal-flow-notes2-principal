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
          {/* Header */}
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

          {/* Search Bar */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm mb-4 sm:mb-6">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar clientes por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fiscal-green-500 focus:border-fiscal-green-500 transition-colors text-base"
              />
            </div>
          </div>

          {/* Customer List */}
          <div className="space-y-4">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map(customer => (
                <div 
                  key={customer.id} 
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-fiscal-green-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="bg-fiscal-green-100 text-fiscal-green-700 p-2 rounded-full mr-3 flex-shrink-0">
                        <User size={18} />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{customer.name}</h3>
                        <p className="text-gray-500 flex items-center mt-1">
                          <Phone size={14} className="mr-1.5" />
                          {customer.phone}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="text-red-500 p-1.5 hover:bg-red-50 rounded-full transition-colors"
                      aria-label="Excluir cliente"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  {(customer.address.street || customer.address.city) && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center text-gray-600 mb-1">
                        <MapPin size={14} className="mr-1.5" />
                        <span className="text-sm font-medium">Endereço</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg text-sm">
                        {customer.address.street && customer.address.number && (
                          <p>{customer.address.street}, {customer.address.number}</p>
                        )}
                        {(customer.address.city || customer.address.state) && (
                          <p>
                            {customer.address.city}
                            {customer.address.city && customer.address.state && ' - '}
                            {customer.address.state}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
                <Info size={36} className="text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-700">Nenhum cliente encontrado</h3>
                <p className="text-gray-500 mt-1">
                  {searchTerm 
                    ? `Nenhum cliente encontrado com "${searchTerm}"`
                    : 'Você ainda não possui clientes cadastrados.'
                  }
                </p>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="mt-3 text-fiscal-green-600 hover:text-fiscal-green-700 text-sm font-medium"
                  >
                    Limpar busca
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerManagement; 