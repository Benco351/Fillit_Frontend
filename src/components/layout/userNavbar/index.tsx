// src/components/layout/Navbar.tsx
import React, { useState } from 'react';
import { Box, Button, IconButton, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoOnly from '../../common/Logo';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../routes/config/routes';
import { NavBarTheme } from '../../../assets/themes/themes';
import MobileDrawer from './MobileDrawer';


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery(NavBarTheme.breakpoints.down('md'));

  const handleNavigateHome = () => {
    navigate(ROUTES.HOME);
  };

  const handleOpenSettings = () => {
    // Your settings opening logic here
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      {/* Logo */}
      <LogoOnly />
      
      {isMobile ? (
        <>
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MenuIcon />
          </IconButton>
          <MobileDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </>
      ) : (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleNavigateHome}
            sx={{ color: 'black' }}
          >
            Home
          </Button>
          <Button
            variant="contained"
            onClick={handleOpenSettings}
            sx={{ color: 'black' }}
          >
            Settings
          </Button>
          <Button
            variant="contained"
            onClick={handleNavigateHome}
            sx={{ color: 'black' }}
          >
            Logout
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Navbar;