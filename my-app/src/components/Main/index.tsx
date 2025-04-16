import React from 'react';
import {
  CssBaseline,
  ThemeProvider,
} from '@mui/material';
import Footer from '../Footer';
import WhyChooseUs from '../WhyChooseUs';
import Features from '../Features';
import Navbar from '../Navbar';
import HeroSection from '../HeroSection';
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
        <HeroSection />
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