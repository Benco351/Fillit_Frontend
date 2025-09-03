import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, ThemeProvider } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../routes/config/routes';
import { DrawerTheme } from '../../../assets/themes/themes';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const isAdmin = typeof window !== 'undefined' && sessionStorage.getItem('isAdmin') === 'true';
  
  const handleHomeClick = () => {
    const targetRoute = isAdmin ? ROUTES.ADMIN : ROUTES.DASHBOARD;
    navigate(targetRoute);
    onClose();
  };
  
  return (
    <ThemeProvider theme={DrawerTheme}>
      <Drawer anchor="right" open={isOpen} onClose={onClose}>
        <Box sx={{ width: 250 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleHomeClick}>
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>
            {isAdmin && (
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to={ROUTES.DEPARTMENTS} onClick={onClose}>
                  <ListItemText primary="Departments" />
                </ListItemButton>
              </ListItem>
            )}
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to={ROUTES.SWAP} onClick={onClose}>
                <ListItemText primary="Swap" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to={isAdmin ? ROUTES.ANNOUNCEMENTS : ROUTES.USER_ANNOUNCEMENTS} onClick={onClose}>
                <ListItemText primary="Announcements" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={onClose}>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to={ROUTES.HOME} onClick={onClose}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </ThemeProvider>
  );
};

export default MobileDrawer;
