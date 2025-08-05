// src/router/AppRoutes.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './config/routes';

import Main            from '../pages/Main';
import SignUpForm      from '../components/auth/SignUpForm';
import LoginForm       from '../components/auth/LoginForm';
import UserDashboard   from '../pages/UserDashboard';
import AdminDashboard  from '../pages/AdminDashboard';
import SettingsPage    from '../pages/Settings';
import SwapPage from '../pages/Swap';
import Departments from '../pages/Departments';
import ShiftInfo from '../pages/ShiftInfo';
import EmployeeInfo from '../pages/EmployeeInfo';

import { signOut } from '@aws-amplify/auth';
import { ProtectedRoute } from './components/ProtectedRoute';

/* ── tiny component that logs out then redirects ─────────── */
function Logout() {
  React.useEffect(() => { signOut(); }, []);
  return <Navigate to={ROUTES.LOGIN} replace />;
}

const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* public */}
      <Route path={ROUTES.HOME}   element={<Main />} />
      <Route path={ROUTES.SIGNUP} element={<SignUpForm />} />
      <Route path={ROUTES.LOGIN}  element={<LoginForm />} />
      <Route path={ROUTES.DASHBOARD} element={<UserDashboard />} />

      {/* private */}

      {/* protected */}
      {/*
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute redirectTo={ROUTES.LOGIN}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.ADMIN}
        element={
          <ProtectedRoute redirectTo={ROUTES.LOGIN} requireGroup="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SWAP}
        // element={
        //   <ProtectedRoute redirectTo={ROUTES.LOGIN}>
        //     <SwapPage />
        //   </ProtectedRoute>
        // }
        element={<SwapPage />}
      />

      <Route
        path={ROUTES.DEPARTMENTS}
        element={
          <ProtectedRoute redirectTo={ROUTES.LOGIN} requireGroup="Admins">
            <Departments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute redirectTo={ROUTES.LOGIN}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      */}
      <Route path={ROUTES.DASHBOARD} element={<UserDashboard />} />
      <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
      <Route path={ROUTES.SWAP} element={<SwapPage />} />
      <Route path={ROUTES.DEPARTMENTS} element={<Departments />} />
      <Route path={ROUTES.SHIFT_INFO} element={<ShiftInfo />} />
      <Route path={ROUTES.EMPLOYEE_INFO} element={<EmployeeInfo />} />
      <Route path="/settings" element={<SettingsPage />} />

      {/* sign-out helper */}
      <Route path="/logout" element={<Logout />} />

      {/* catch-all */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
