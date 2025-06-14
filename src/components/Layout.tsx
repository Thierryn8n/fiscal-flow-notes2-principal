import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6">
            {children}
        </main>
        </div>
    </div>
  );
};

export default Layout;