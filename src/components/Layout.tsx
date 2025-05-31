import React, { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, Printer, LogOut, Menu, ChevronLeft, ChevronRight, Settings, Users, BarChart, Package, Download, X, UserCog, ShoppingBag, ShoppingCart, Store, LayoutDashboard } from 'lucide-react';
import Logo from './ui/Logo';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SettingsService } from '@/services/settings.service';
import { EcommerceSettings } from '@/types/settings';
import { AuthError } from '@supabase/supabase-js';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ecommerceSettings, setEcommerceSettings] = useState<EcommerceSettings | null | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    const checkAuthAndLoadSettings = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error getting session:", sessionError.message);
        if (isMounted) navigate('/');
        return;
      }
      
      if (!sessionData.session) {
        if (isMounted) navigate('/');
        return;
      }

      try {
        const userSettings = await SettingsService.getUserSettings();
        if (isMounted) {
          if (userSettings?.ecommerce_settings) {
            setEcommerceSettings(userSettings.ecommerce_settings);
          } else {
            setEcommerceSettings({ enabled: false, admin_panel_enabled: false });
          }
        }
      } catch (error) {
        console.error("Failed to load user settings:", error);
        if (isMounted) {
          setEcommerceSettings({ enabled: false, admin_panel_enabled: false });
          toast({
            title: 'Erro ao carregar configurações',
            description: error instanceof Error ? error.message : 'Não foi possível carregar as configurações do usuário.',
            variant: 'destructive',
          });
        }
      }
    };
    
    checkAuthAndLoadSettings();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (isMounted) navigate('/');
      } else if (event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
        checkAuthAndLoadSettings();
      }
    });
    
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed && isMounted) {
      setCollapsed(savedCollapsed === 'true');
    }
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Logout realizado com sucesso',
        description: 'Você foi desconectado do sistema.',
      });
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: 'Erro ao fazer logout',
        description: error instanceof AuthError ? error.message : 'Ocorreu um erro ao tentar desconectar.',
        variant: 'destructive',
      });
    }
  };

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const isEcommerceAdminRouteActive = () => {
    const adminPaths = ['/ecommerce/dashboard', '/ecommerce/customers', '/ecommerce/orders', '/ecommerce/products', '/ecommerce/settings'];
    return adminPaths.some(path => location.pathname.startsWith(path));
  };

  const isLoadingSettings = ecommerceSettings === undefined;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside 
        className={`h-screen bg-white border-r border-black/10 transition-all duration-300 ease-in-out z-30 hidden md:block ${
          collapsed ? 'w-[70px]' : 'w-[240px]'
        }`}
      >
        <div className="relative h-16 flex items-center justify-between border-b border-black/10 px-4">
          <div className={`flex items-center transition-all ${collapsed ? 'justify-center w-full' : ''}`}>
            {!collapsed && <Logo />}
            {collapsed && <Logo small />}
          </div>
          <button
            onClick={toggleSidebar}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-8 w-8 rounded-full bg-white border border-black/10 shadow-md flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-50 focus:outline-none transition-colors z-50"
            aria-label={collapsed ? "Expandir menu" : "Retrair menu"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex flex-col h-[calc(100%-4rem)] overflow-y-auto">
          <div className="flex-grow py-4">
            <ul className="space-y-1 px-2">
              <li>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-3 rounded-md ${
                    isActive('/dashboard') 
                      ? 'bg-fiscal-green-50 text-fiscal-green-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Home size={20} className={isActive('/dashboard') ? 'text-fiscal-green-500' : ''} />
                  {!collapsed && <span className="ml-3">Início</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/notes" 
                  className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-3 rounded-md ${
                    isActive('/notes') 
                      ? 'bg-fiscal-green-50 text-fiscal-green-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FileText size={20} className={isActive('/notes') ? 'text-fiscal-green-500' : ''} />
                  {!collapsed && <span className="ml-3">Notas Fiscais</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/notes/new" 
                  className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-3 rounded-md ${
                    isActive('/notes/new') 
                      ? 'bg-fiscal-green-50 text-fiscal-green-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FileText size={20} className={isActive('/notes/new') ? 'text-fiscal-green-500' : ''} />
                  {!collapsed && <span className="ml-3">Nova Nota</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-3 rounded-md ${
                    isActive('/products') 
                      ? 'bg-fiscal-green-50 text-fiscal-green-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Package size={20} className={isActive('/products') ? 'text-fiscal-green-500' : ''} />
                  {!collapsed && <span className="ml-3">Produtos</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/print" 
                  className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-3 rounded-md ${
                    isActive('/print') 
                      ? 'bg-fiscal-green-50 text-fiscal-green-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Printer size={20} className={isActive('/print') ? 'text-fiscal-green-500' : ''} />
                  {!collapsed && <span className="ml-3">Impressão</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/customers" 
                  className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-3 rounded-md ${
                    isActive('/customers') 
                      ? 'bg-fiscal-green-50 text-fiscal-green-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users size={20} className={isActive('/customers') ? 'text-fiscal-green-500' : ''} />
                  {!collapsed && <span className="ml-3">Clientes</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/sellers" 
                  className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-3 rounded-md ${
                    isActive('/sellers') 
                      ? 'bg-fiscal-green-50 text-fiscal-green-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <UserCog size={20} className={isActive('/sellers') ? 'text-fiscal-green-500' : ''} />
                  {!collapsed && <span className="ml-3">Vendedores</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/reports" 
                  className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-3 rounded-md ${
                    isActive('/reports') 
                      ? 'bg-fiscal-green-50 text-fiscal-green-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart size={20} className={isActive('/reports') ? 'text-fiscal-green-500' : ''} />
                  {!collapsed && <span className="ml-3">Relatórios</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/settings" 
                  className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-3 rounded-md ${
                    isActive('/settings') 
                      ? 'bg-fiscal-green-50 text-fiscal-green-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings size={20} className={isActive('/settings') ? 'text-fiscal-green-500' : ''} />
                  {!collapsed && <span className="ml-3">Configurações</span>}
                </Link>
              </li>

              {!isLoadingSettings && ecommerceSettings && (
                <>
                  {ecommerceSettings.enabled && (
                    <li className="mt-2 pt-2 border-t border-gray-200">
                      <Link 
                        to="/ecommerce"
                        className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-3 rounded-md ${
                          isActive('/ecommerce') && !isEcommerceAdminRouteActive()
                            ? 'bg-fiscal-purple-50 text-fiscal-purple-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Store size={20} className={isActive('/ecommerce') && !isEcommerceAdminRouteActive() ? 'text-fiscal-purple-500' : ''} />
                        {!collapsed && <span className="ml-3">Ver Loja</span>}
                      </Link>
                    </li>
                  )}
                  {ecommerceSettings.admin_panel_enabled && (
                    <li className={ecommerceSettings.enabled ? "mt-1" : "mt-2 pt-2 border-t border-gray-200"}>
                      <Link
                        to="/ecommerce/dashboard"
                        className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-3 rounded-md ${
                          isEcommerceAdminRouteActive()
                            ? 'bg-fiscal-purple-50 text-fiscal-purple-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <LayoutDashboard size={20} className={isEcommerceAdminRouteActive() ? 'text-fiscal-purple-500' : ''} />
                        {!collapsed && <span className="ml-3">Admin E-commerce</span>}
                      </Link>
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
          
          <div className="mt-auto pb-4 border-t border-black/5 pt-2">
            <ul className="space-y-1 px-2">
              <li>
                <button 
                  onClick={handleLogout}
                  className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-3 rounded-md text-red-500 hover:bg-red-50`}
                >
                  <LogOut size={20} />
                  {!collapsed && <span className="ml-3">Sair</span>}
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>
        
      <main className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300">
        <header className="bg-black text-white py-2 px-4 md:hidden flex items-center justify-between">
          <div className="flex items-center">
            <Logo />
            <h1 className="ml-3 text-xl font-cascadia">Fiscal Flow</h1>
          </div>
          <button 
            onClick={toggleMobileMenu}
            className="focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>
          
        <div className="flex-1 overflow-auto flex flex-col min-h-[calc(100vh-56px)]">
          <div className="flex-grow container mx-auto py-6 px-4 mb-16 md:mb-0">
            {children}
          </div>
            
          <footer className="bg-black text-white py-4 text-center mt-auto hidden md:block">
            <div className="container mx-auto">
              <p className="text-sm">
                © {new Date().getFullYear()} Fiscal Flow Notes. Todos os direitos reservados.
              </p>
            </div>
          </footer>
        </div>
        
        <nav className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-40 md:hidden shadow-lg rounded-t-xl ${
          mobileMenuOpen ? 'translate-y-0' : 'translate-y-full'
        } transition-transform duration-300 ease-in-out`}>
          <div className="p-4 bg-gray-50 border-b border-gray-200 rounded-t-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-800">Menu</h3>
              <button onClick={toggleMobileMenu} className="p-1.5 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            <ul className="divide-y divide-gray-100">
              <li>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center px-4 py-3.5 ${isActive('/dashboard') ? 'bg-fiscal-green-50 text-fiscal-green-700' : 'text-gray-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home size={20} className={`mr-3 ${isActive('/dashboard') ? 'text-fiscal-green-500' : ''}`} />
                  <span>Início</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/notes" 
                  className={`flex items-center px-4 py-3.5 ${isActive('/notes') ? 'bg-fiscal-green-50 text-fiscal-green-700' : 'text-gray-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText size={20} className={`mr-3 ${isActive('/notes') ? 'text-fiscal-green-500' : ''}`} />
                  <span>Notas Fiscais</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/notes/new" 
                  className={`flex items-center px-4 py-3.5 ${isActive('/notes/new') ? 'bg-fiscal-green-50 text-fiscal-green-700' : 'text-gray-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText size={20} className={`mr-3 ${isActive('/notes/new') ? 'text-fiscal-green-500' : ''}`} />
                  <span>Nova Nota</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className={`flex items-center px-4 py-3.5 ${isActive('/products') ? 'bg-fiscal-green-50 text-fiscal-green-700' : 'text-gray-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package size={20} className={`mr-3 ${isActive('/products') ? 'text-fiscal-green-500' : ''}`} />
                  <span>Produtos</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/print" 
                  className={`flex items-center px-4 py-3.5 ${isActive('/print') ? 'bg-fiscal-green-50 text-fiscal-green-700' : 'text-gray-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Printer size={20} className={`mr-3 ${isActive('/print') ? 'text-fiscal-green-500' : ''}`} />
                  <span>Impressão</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/customers" 
                  className={`flex items-center px-4 py-3.5 ${isActive('/customers') ? 'bg-fiscal-green-50 text-fiscal-green-700' : 'text-gray-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users size={20} className={`mr-3 ${isActive('/customers') ? 'text-fiscal-green-500' : ''}`} />
                  <span>Clientes</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/sellers" 
                  className={`flex items-center px-4 py-3.5 ${isActive('/sellers') ? 'bg-fiscal-green-50 text-fiscal-green-700' : 'text-gray-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCog size={20} className={`mr-3 ${isActive('/sellers') ? 'text-fiscal-green-500' : ''}`} />
                  <span>Vendedores</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/reports" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3.5 ${isActive('/reports') ? 'bg-fiscal-green-50 text-fiscal-green-700' : 'text-gray-700'}`}
                >
                  <BarChart size={20} className={`mr-3 ${isActive('/reports') ? 'text-fiscal-green-500' : ''}`} />
                  <span>Relatórios</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/settings" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3.5 ${isActive('/settings') ? 'bg-fiscal-green-50 text-fiscal-green-700' : 'text-gray-700'}`}
                >
                  <Settings size={20} className={`mr-3 ${isActive('/settings') ? 'text-fiscal-green-500' : ''}`} />
                  <span>Configurações</span>
                </Link>
              </li>

              {!isLoadingSettings && ecommerceSettings && (
                <>
                  {ecommerceSettings.enabled && (
                    <li className="border-t border-gray-100 pt-1">
                      <Link 
                        to="/ecommerce"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-3.5 ${isActive('/ecommerce') && !isEcommerceAdminRouteActive() ? 'bg-fiscal-purple-50 text-fiscal-purple-700' : 'text-gray-700'}`}
                      >
                        <Store size={20} className={`mr-3 ${isActive('/ecommerce') && !isEcommerceAdminRouteActive() ? 'text-fiscal-purple-500' : ''}`} />
                        <span>Ver Loja</span>
                      </Link>
                    </li>
                  )}
                  {ecommerceSettings.admin_panel_enabled && (
                    <li className={ecommerceSettings.enabled ? "" : "border-t border-gray-100 pt-1"}>
                      <Link
                        to="/ecommerce/dashboard"
                        onClick={() => {
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center px-4 py-3.5 font-medium ${isEcommerceAdminRouteActive() ? 'bg-fiscal-purple-50 text-fiscal-purple-700' : 'text-gray-700'}`}
                      >
                        <LayoutDashboard size={18} className={`mr-3 ${isEcommerceAdminRouteActive() ? 'text-fiscal-purple-500' : ''}`} />
                         Admin E-commerce
                      </Link>
                    </li>
                  )}
                </>
              )}
              
              <li className="border-t border-gray-100 mt-1">
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3.5 text-red-500"
                >
                  <LogOut size={20} className="mr-3" />
                  <span>Sair</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
        
        <div className="fixed bottom-4 left-0 right-0 mx-auto w-[95%] max-w-sm bg-white border border-gray-200 rounded-full shadow-lg md:hidden">
          <div className="flex justify-around items-center py-2">
            <Link 
              to="/dashboard" 
              className={`flex flex-col items-center p-2 ${isActive('/dashboard') ? 'text-fiscal-green-600' : 'text-gray-600'}`}
            >
              <Home size={22} className={isActive('/dashboard') ? 'text-fiscal-green-500' : ''} />
              <span className="text-xs mt-1 font-medium">Início</span>
            </Link>
            <Link 
              to="/ecommerce" 
              className={`flex flex-col items-center p-2 ${isActive('/ecommerce') && !location.pathname.startsWith('/ecommerce/dashboard') ? 'text-fiscal-green-600' : 'text-gray-600'}`}
            >
              <ShoppingBag size={22} className={isActive('/ecommerce') && !location.pathname.startsWith('/ecommerce/dashboard') ? 'text-fiscal-green-500' : ''} />
              <span className="text-xs mt-1 font-medium">Loja</span>
            </Link>
            <button
              onClick={toggleMobileMenu}
              className="flex flex-col items-center justify-center p-2 relative"
            >
              <div className="bg-fiscal-green-500 rounded-full h-12 w-12 flex items-center justify-center -mt-5 shadow-md">
                <Menu size={24} className="text-white" />
              </div>
              <span className="text-xs mt-1 text-fiscal-green-600 font-medium">Menu</span>
            </button>
            <Link 
              to="/notes" 
              className={`flex flex-col items-center p-2 ${isActive('/notes') ? 'text-fiscal-green-600' : 'text-gray-600'}`}
            >
              <FileText size={22} className={isActive('/notes') ? 'text-fiscal-green-500' : ''} />
              <span className="text-xs mt-1 font-medium">Notas</span>
            </Link>
            <Link 
              to="/ecommerce/dashboard" 
              className={`flex flex-col items-center p-2 ${location.pathname.startsWith('/ecommerce/dashboard') ? 'text-fiscal-green-600' : 'text-gray-600'}`}
            >
              <ShoppingCart size={22} className={location.pathname.startsWith('/ecommerce/dashboard') ? 'text-fiscal-green-500' : ''} />
              <span className="text-xs mt-1 font-medium">Painel</span>
            </Link>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 md:hidden" 
            onClick={toggleMobileMenu}
          ></div>
        )}
      </main>
    </div>
  );
};

export default Layout;