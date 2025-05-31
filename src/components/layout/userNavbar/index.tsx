// src/components/layout/Navbar.tsx
import React, { useState } from 'react';
import { Box, Button, IconButton, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoOnly from '../../common/Logo';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../routes/config/routes';
import { NavBarTheme } from '../../../assets/themes/themes';
import MobileDrawer from './MobileDrawer';
import { signOut } from '@aws-amplify/auth';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery(NavBarTheme.breakpoints.down('md'));

  // Detect admin mode from sessionStorage
  const isAdmin = typeof window !== 'undefined' && sessionStorage.getItem('isAdmin') === 'true';

  const handleLogout = () => {
    signOut();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const handleOpenSettings = () => {
    navigate('/settings');
  };

  const glassButtonStyle = {
    background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.1), rgba(0, 194, 140, 0.2))',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(0, 194, 140, 0.3)',
    color: '#00c28c',
    textTransform: 'none',
    padding: '8px 20px',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: 500,
    letterSpacing: '0.5px',
    boxShadow: '0 4px 15px rgba(0, 194, 140, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.2), rgba(0, 194, 140, 0.3))',
      border: '1px solid rgba(0, 194, 140, 0.5)',
      boxShadow: '0 8px 20px rgba(0, 194, 140, 0.2)',
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(1px)',
      boxShadow: '0 2px 10px rgba(0, 194, 140, 0.15)',
    }
  };

  const logoutButtonStyle = {
    background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.2))',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(244, 67, 54, 0.3)',
    color: '#f44336',
    textTransform: 'none',
    padding: '8px 20px',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: 500,
    letterSpacing: '0.5px',
    boxShadow: '0 4px 15px rgba(244, 67, 54, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.2), rgba(244, 67, 54, 0.3))',
      border: '1px solid rgba(244, 67, 54, 0.5)',
      boxShadow: '0 8px 20px rgba(244, 67, 54, 0.2)',
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(1px)',
      boxShadow: '0 2px 10px rgba(244, 67, 54, 0.15)',
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      {/* Logo */}
      <LogoOnly color={'white'} />
      
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
            onClick={handleLogout}
            sx={glassButtonStyle}
          >
            Home
          </Button>
          <Button
            variant="contained"
            onClick={handleOpenSettings}
            sx={glassButtonStyle}
          >
            Settings
          </Button>
          <Button
            variant="contained"
            onClick={handleLogout}
            sx={logoutButtonStyle}
          >
            Logout
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Navbar;