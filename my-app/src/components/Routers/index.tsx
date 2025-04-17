import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';

import Main        from '../Main';       // landing page
import SignUpPage  from '../SignUp';
import LogInPage   from '../Login';
import UserDashboard   from '../UserDashboard';  // example protected page

// wrap anything that must be behind login
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuthenticator((context) => [context.user]);
  return user
    ? children
    : <Navigate to="/login" replace />;
}

const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* public */}
      <Route path="/"       element={<Main />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login"  element={<LogInPage />} />

      {/* protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* catch‑all redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
