// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router';
import { useAuths } from '../hooks/useAuths';
import { ProtectedRouteProps } from '../interface/IAuthen';



export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, allowedRoles }) => {
  const { isAuthenticated, userRole } = useAuths();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/404" replace />;
  }

  return <Component />;
};