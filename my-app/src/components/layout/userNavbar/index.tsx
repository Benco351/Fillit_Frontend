// src/components/layout/Navbar.tsx
import React, { useState } from 'react';
import { Box, Button, IconButton, Menu, MenuItem as DropdownMenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoOnly from '../../common/Logo';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import { ROUTES } from '../../../routes/config/routes'; // Update the path to the correct location of the ROUTES object

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();  // Initialize the navigate function

  const handleNavigateHome = () => {
    navigate(ROUTES.HOME);  // Navigate to home route
  };

  const handleOpenSettings = () => {
    // Your settings opening logic here
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      {/* Logo */}
      <LogoOnly />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={handleNavigateHome}
          sx={{ color: 'white' }}
        >
          Home
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleOpenSettings}
          sx={{ color: 'white' }}
        >
          Settings
        </Button>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleMenuOpen}
          sx={{ color: 'white' }}
        >
          <MenuIcon />
        </IconButton>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <DropdownMenuItem onClick={handleMenuClose}>Profile</DropdownMenuItem>
        <DropdownMenuItem onClick={handleMenuClose}>Settings</DropdownMenuItem>
        <DropdownMenuItem onClick={handleMenuClose}>Logout</DropdownMenuItem>
      </Menu>
    </Box>
  );
};

export default Navbar;
