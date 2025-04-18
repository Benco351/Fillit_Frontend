import React from 'react';
import {
  CssBaseline,
  ThemeProvider,
} from '@mui/material';
import Footer from '../../components/layout/Footer';
import WhyChooseUs from '../../components/sections/WhyChooseUs';
import Features from '../../components/sections/Features';
import Navbar from '../../components/layout/Navbar';
import Header from '../../components/layout/Header';
import { MainTheme } from '../../assets/themes/themes';


// Landing Page Component
const Main: React.FC = () => {

  return (
    <>
      <ThemeProvider theme={MainTheme}>
        <CssBaseline />
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
      </ThemeProvider>
    </>
  );
};

export default Main;