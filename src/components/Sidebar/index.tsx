import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  FileText,
  Users,
  Package,
  Settings,
  Printer,
  BarChart3,
  UserCog
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    icon: BarChart3,
    href: '/dashboard'
  },
  {
    title: 'Notas Fiscais',
    icon: FileText,
    href: '/notas'
  },
  {
    title: 'Clientes',
    icon: Users,
    href: '/clientes'
  },
  {
    title: 'Produtos',
    icon: Package,
    href: '/produtos'
  },
  {
    title: 'Vendedores',
    icon: UserCog,
    href: '/vendedores'
  },
  {
    title: 'Impressão',
    icon: Printer,
    href: '/impressao'
  },
  {
    title: 'Configurações',
    icon: Settings,
    href: '/configuracoes'
  }
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              location.pathname === item.href
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}; 