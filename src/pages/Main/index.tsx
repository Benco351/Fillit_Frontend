import React from 'react';
import {
  CssBaseline,
  ThemeProvider,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import WhyChooseUs from '../../components/sections/WhyChooseUs';
import Features from '../../components/sections/Features';
import Navbar from '../../components/layout/Navbar';
import Header from '../../components/layout/Header';
import { MainTheme } from '../../assets/themes/themes';
import AIChatPopup from '../../components/aiChat';



// Landing Page Component
const Main: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <ThemeProvider theme={MainTheme}>
        <CssBaseline />
        <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
          {/* NavBar section */}
          <Navbar />
          {/* Hero Section */}
          <Header />
          {/* Features Section */}
          <Features />
          {/* Why Choose Section */}
          <WhyChooseUs />
          {/* Footer */}
          <Footer />
        </Box>
        
      </ThemeProvider>
    </>
  );
};

export default Main;