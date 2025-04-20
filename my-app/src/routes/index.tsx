import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ROUTES } from './config/routes';

// Page imports
import Main from '../pages/Main';
import SignUpForm from '../components/auth/SignUpForm';
import LoginForm from '../components/auth/LoginForm';
import UserDashboard from '../pages/UserDashboard';

const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.HOME} element={<Main />} />
      <Route path={ROUTES.SIGNUP} element={<SignUpForm />} />
      <Route path={ROUTES.LOGIN} element={<LoginForm />} />
      <Route path={ROUTES.DASHBOARD} element={<UserDashboard />} />

      {/* Protected routes */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
