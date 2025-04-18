import { Navigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { ROUTES } from '../config/routes';

interface ProtectedRouteProps {
  children: JSX.Element;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useAuthenticator((context) => [context.user]);
  
  return user ? children : <Navigate to={ROUTES.LOGIN} replace />;
};