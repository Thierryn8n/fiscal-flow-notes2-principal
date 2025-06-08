import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import Layout from '@/components/Layout';
import { Package, Plus, Trash2, Tag, Search, Image, Edit, Save, X, Upload, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { validateAndProcessCsv, CsvProductData } from '@/utils/csvImport';
import CsvHelpDialog from '@/components/CsvHelpDialog';
import { useSessionRefresh } from '@/hooks/useSessionRefresh';

// Definição dos tipos do Supabase
interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: ProductUpdate;
      };
    };
  };
}

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  description: string | null;
  image_path: string | null;
  imageurl: string | null;
  ncm: string | null;
  unit: string | null;
  quantity: number | null;
  total: number | null;
  owner_id: string;
  created_at: string | null;
  updated_at: string | null;
  category_id: string | null;
}

type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
type ProductUpdate = Partial<ProductInsert>;

const defaultFormData: ProductInsert = {
  name: '',
  code: '',
  price: 0,
  description: null,
  image_path: null,
  imageurl: null,
  ncm: null,
  unit: 'UN',
  quantity: 0,
  total: 0,
  owner_id: '',
  category_id: null,
};

const EditProductDialog = DialogPrimitive.Root;
const EditProductDialogClose = DialogPrimitive.Close;

const EditProductDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/50 backdrop-blur-sm", className)}
    {...props}
  />
));

const EditProductDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <EditProductDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn("fixed left-1/2 top-1/2 z-50 w-[95%] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-4 shadow-xl sm:p-6", className)}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-3 top-3 rounded-full bg-gray-100 p-2 opacity-70 transition-all hover:bg-gray-200 hover:opacity-100">
        <X className="h-4 w-4" />
        <span className="sr-only">Fechar</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));

const EditProductDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);

const EditProductDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);

const EditProductDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-xl font-semibold text-gray-900", className)} {...props} />
));

const ProductDialog = EditProductDialog;
const ProductDialogContent = EditProductDialogContent;
const ProductDialogHeader = EditProductDialogHeader;
const ProductDialogFooter = EditProductDialogFooter;
const ProductDialogTitle = EditProductDialogTitle;
const ProductDialogClose = EditProductDialogClose;

const inputStyles = "w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fiscal-green-500 focus:border-fiscal-green-500 transition-colors shadow-sm";

const ProductManagement: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  useSessionRefresh();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(50);
  const [formData, setFormData] = useState<ProductInsert>(defaultFormData);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      setProducts(data as Product[] || []);
    } catch (error) {
      toast({ title: 'Erro ao carregar produtos', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? (value === '' ? null : parseFloat(value)) : value;
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };
  
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const productData: ProductInsert = { ...formData, owner_id: user.id };

    try {
      if (editingProduct) {
        const { data, error } = await supabase
          .from('products')
          .update(productData as ProductUpdate)
          .eq('id', editingProduct.id)
          .select().single();
        if (error) throw error;
        setProducts(products.map(p => (p.id === editingProduct.id ? data as Product : p)));
        toast({ title: 'Produto atualizado!', variant: 'success' });
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productData).select().single();
        if (error) throw error;
        setProducts([...products, data as Product]);
        toast({ title: 'Produto adicionado!', variant: 'success' });
      }
      closeModal();
    } catch (error) {
      toast({ title: 'Erro ao salvar produto', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza?')) return;
    try {
      await supabase.from('products').delete().eq('id', id);
      setProducts(products.filter(p => p.id !== id));
      toast({ title: 'Produto excluído!', variant: 'success' });
    } catch (error) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }
  };
  
  const openModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({ ...defaultFormData, owner_id: user?.id || '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData(defaultFormData);
  };

  const getSafeValue = (value: any | null | undefined, defaultValue: any): any => {
    if (value === null || value === undefined) return defaultValue;
    return value;
  };

  const filteredProducts = products.filter(product => {
    const term = searchTerm.toLowerCase();
    return (
      (product.name || '').toLowerCase().includes(term) ||
      (product.code || '').toLowerCase().includes(term) ||
      (product.ncm || '').toLowerCase().includes(term)
    );
  });
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    e.target.value = '';
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return toast({ title: 'Erro', description: 'Arquivo CSV vazio.', variant: 'destructive' });
      
      const result = validateAndProcessCsv(text);
      if (!result.valid) return toast({ title: 'Erro no CSV', description: result.errors[0], variant: 'destructive' });
      
      try {
        setIsLoading(true);
        const productsToInsert: ProductInsert[] = result.products.map((p: CsvProductData) => ({
          name: p.name,
          code: p.code || `IMP-${Date.now()}`.slice(0, 9),
          price: p.price,
          description: null,
          ncm: p.ncm || null,
          unit: p.unit || 'UN',
          quantity: p.quantity || 0,
          total: p.total || 0,
          owner_id: user.id,
          image_path: null,
          imageurl: null,
          category_id: null
        }));
        
        const { data, error } = await supabase
          .from('products')
          .insert(productsToInsert)
          .select();

        if (error) throw error;
        
        setProducts(prev => [...prev, ...(data as Product[])]);
        toast({ title: 'Produtos importados!', variant: 'success' });
      } catch (error) {
        toast({ title: 'Erro na importação', description: (error as Error).message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <h2 className="text-2xl font-cascadia mb-4 md:mb-0 flex items-center">
              <span className="bg-fiscal-green-500 text-white p-2 rounded-lg mr-3"><Package size={20} /></span>
              Gerenciamento de Produtos
            </h2>
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <label htmlFor="csvImport" className={`btn-secondary rounded-full flex items-center px-5 cursor-pointer ${isLoading ? 'opacity-50' : ''}`}>
                  <Upload size={18} className="mr-1" /> Importar CSV
                </label>
                <input type="file" id="csvImport" accept=".csv" className="hidden" onChange={handleCSVImport} disabled={isLoading} />
                <div className="absolute right-0 mt-2 hidden group-hover:block"><CsvHelpDialog trigger={<button className="flex items-center text-sm p-1"><HelpCircle size={14} /></button>} /></div>
              </div>
              <button onClick={() => openModal(null)} className="btn-primary rounded-full flex items-center px-5" disabled={isLoading}>
                <Plus size={18} className="mr-1" /> Novo Produto
              </button>
            </div>
          </div>
        </div>
        
        <ProductDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <ProductDialogContent>
            <ProductDialogHeader>
              <ProductDialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</ProductDialogTitle>
            </ProductDialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="name" className="block text-sm font-medium mb-1">Nome*</label><input id="name" name="name" value={formData.name} onChange={handleFormChange} className={inputStyles} required /></div>
                <div><label htmlFor="code" className="block text-sm font-medium mb-1">Código*</label><input id="code" name="code" value={formData.code} onChange={handleFormChange} className={inputStyles} required maxLength={9} /></div>
                <div><label htmlFor="price" className="block text-sm font-medium mb-1">Preço (R$)*</label><input type="number" id="price" name="price" value={getSafeValue(formData.price, 0)} onChange={handleFormChange} className={inputStyles} required step="0.01" /></div>
                <div><label htmlFor="ncm" className="block text-sm font-medium mb-1">NCM</label><input id="ncm" name="ncm" value={getSafeValue(formData.ncm, '')} onChange={handleFormChange} className={inputStyles} maxLength={9} /></div>
                <div><label htmlFor="unit" className="block text-sm font-medium mb-1">Unidade</label><input id="unit" name="unit" value={getSafeValue(formData.unit, 'UN')} onChange={handleFormChange} className={inputStyles} maxLength={9} /></div>
                <div><label htmlFor="quantity" className="block text-sm font-medium mb-1">Quantidade</label><input type="number" id="quantity" name="quantity" value={getSafeValue(formData.quantity, 0)} onChange={handleFormChange} className={inputStyles} /></div>
              </div>
              <div><label htmlFor="description" className="block text-sm font-medium mb-1">Descrição</label><textarea id="description" name="description" value={getSafeValue(formData.description, '')} onChange={handleFormChange} className={inputStyles} rows={3}></textarea></div>
              <div><label htmlFor="image_path" className="block text-sm font-medium mb-1">URL da Imagem</label><input type="url" id="image_path" name="image_path" value={getSafeValue(formData.image_path, '')} onChange={handleFormChange} className={inputStyles} /></div>
              <ProductDialogFooter>
                <ProductDialogClose asChild><button type="button" className="btn-secondary">Cancelar</button></ProductDialogClose>
                <button type="submit" className="btn-primary flex items-center"><Save size={18} className="mr-2" /> Salvar</button>
              </ProductDialogFooter>
            </form>
          </ProductDialogContent>
        </ProductDialog>
        
        <div className="bg-white p-6 rounded-xl border">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-2 pl-10 pr-4 rounded-full border focus:ring-fiscal-green-500" />
          </div>
          
          {isLoading ? <div className="text-center p-10">Carregando...</div> :
           filteredProducts.length === 0 ? <div className="text-center p-10 text-gray-500">Nenhum produto encontrado.</div> : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentProducts.map(product => (
                  <div key={product.id} className="border rounded-xl p-4 flex items-start space-x-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-md flex items-center justify-center">
                      {product.image_path ? <img src={product.image_path} alt={product.name} className="w-full h-full object-cover rounded-md"/> : <Image size={24} className="text-gray-400"/>}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold truncate">{product.name}</h4>
                      <p className="text-sm text-gray-500"><Tag size={14} className="inline mr-1"/>{product.code}</p>
                      <p className="font-medium mt-1">R$ {product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <button onClick={() => openModal(product)} className="p-1 text-blue-600 hover:text-blue-800"><Edit size={18}/></button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-2">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 disabled:text-gray-300"><ChevronLeft size={20} /></button>
                  <span>{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 disabled:text-gray-300"><ChevronRight size={20} /></button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductManagement;