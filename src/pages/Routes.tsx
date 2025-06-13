import { BrowserRouter, Routes as RouterRoutes, Route, Outlet } from 'react-router-dom';
import Login from '@/pages/auth/Login';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import RecoverPassword from '@/components/RecoverPassword';
import ConfiguracoesMelhoradas from '@/pages/ConfiguracoesMelhoradas';
import Dashboard from '@/pages/Dashboard';
import NotesManagement from '@/pages/NotesManagement';
import CustomersManagement from '@/pages/CustomersManagement';
import ProductManagement from '@/pages/ProductManagement';
import SellersManagement from '@/pages/SellersManagement';
import Print from '@/pages/Print';
import PrivateRoute from '@/components/PrivateRoute';
import { Layout } from '@/components/Layout';

export const Routes = () => {
  return (
    <BrowserRouter>
      <RouterRoutes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<RecoverPassword />} />

        {/* Rotas Privadas */}
        <Route path="/" element={<PrivateRoute><Layout><Outlet /></Layout></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="notas" element={<NotesManagement />} />
          <Route path="clientes" element={<CustomersManagement />} />
          <Route path="produtos" element={<ProductManagement />} />
          <Route path="vendedores" element={<SellersManagement />} />
          <Route path="impressao" element={<Print />} />
          <Route path="configuracoes" element={<ConfiguracoesMelhoradas />} />
        </Route>
      </RouterRoutes>
    </BrowserRouter>
  );
}; 