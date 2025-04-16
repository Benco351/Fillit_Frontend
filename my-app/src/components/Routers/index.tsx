import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Main from '../Main';  // Correct path for LandingPage
import SignUpPage from '../SignUp';    // Correct path for SignPage
import LogInPage from '../Login';    // Correct path for SignPage

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Main />} />
    <Route path="/signup" element={<SignUpPage />} />
    <Route path="/login" element={<LogInPage />} />
  </Routes>
);

export default AppRoutes;
