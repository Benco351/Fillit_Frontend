import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../Main';  // Correct path for LandingPage
import LoginPage from '../LoginPage';    // Correct path for LoginPage

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
  </Routes>
);

export default AppRoutes;
