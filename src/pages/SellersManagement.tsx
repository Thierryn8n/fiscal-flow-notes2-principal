import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Mail, 
  Phone,
  MapPin,
  User,
  Shield,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  role: 'admin' | 'seller';
  created_at: string;
  updated_at: string;
}

interface SellerStats {
  totalSales: number;
  totalNotes: number;
  averageValue: number;
  lastActivity: string;
}

const SellersManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [formData, setFormData] = useState<Partial<Seller>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    role: 'seller'
  });

  const filteredSellers = sellers.filter(seller => 
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenNewSellerDialog = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      status: 'active',
      role: 'seller'
    });
    setEditingSeller(null);
    setIsDialogOpen(true);
  };

  const renderSellerProfile = (seller: Seller) => (
    <Card key={seller.id} className="p-4">
      <div className="flex items-center justify-between">
            <div>
          <h3 className="font-semibold">{seller.name}</h3>
          <p className="text-sm text-gray-500">{seller.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditingSeller(seller)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDeleteSeller(seller.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        </div>
      </Card>
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de submissão
  };

  const handleDeleteSeller = async (id: string) => {
    // Implementar lógica de exclusão
  };

    return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Vendedores</h1>
        <Button onClick={handleOpenNewSellerDialog}>
          <Plus className="mr-2 h-4 w-4" />
            Novo Vendedor
          </Button>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Buscar vendedores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4">
        {filteredSellers.map((seller) => renderSellerProfile(seller))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSeller ? 'Editar Vendedor' : 'Novo Vendedor'}</DialogTitle>
            <DialogDescription>
              {editingSeller ? 'Atualize os dados do vendedor.' : 'Preencha os dados do novo vendedor.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Telefone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
  );
};

export default SellersManagement;