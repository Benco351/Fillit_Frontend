import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, ThemeProvider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../../../routes/config/routes';
import { DrawerTheme } from '../../../assets/themes/themes';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  return (
    <ThemeProvider theme={DrawerTheme}>
      <Drawer anchor="right" open={isOpen} onClose={onClose}>
        <Box sx={{ width: 250 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/login" onClick={onClose}>
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/signup" onClick={onClose}>
                <ListItemText primary="Signup" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to={ROUTES.DASHBOARD} onClick={onClose}>
                <ListItemText primary="Calendar" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </ThemeProvider>
  );
};

export default MobileDrawer;
