import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirecionar para login com o caminho atual como parâmetro de redirecionamento
    const currentPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${currentPath}`} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute; 