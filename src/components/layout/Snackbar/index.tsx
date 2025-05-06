// src/components/layout/Navbar.tsx

import MenuIcon from '@mui/icons-material/Menu';
import LogoOnly from '../../common/Logo';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../routes/config/routes';
import { NavBarTheme } from '../../../assets/themes/themes';

import React, { useState } from 'react';
import { Snackbar as MuiSnackbar, Alert } from '@mui/material';

const Snackbar = () => {
  const [error, setError] = useState<string | null>(null);

  return (
    <MuiSnackbar
      open={!!error}
      autoHideDuration={6000}
      onClose={() => setError(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        bottom: { xs: 0, sm: 24 },
        left: { xs: 0, sm: '50%' },
        transform: { xs: 'none', sm: 'translateX(-50%)' }
      }}
    >
      <Alert severity="error" onClose={() => setError(null)}>
        {error}
      </Alert>
    </MuiSnackbar>
  );
};

export default Snackbar;


