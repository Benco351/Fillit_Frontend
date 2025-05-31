import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/config/routes';

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

const SettingsPage = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', background: 'rgba(255,255,255,0.7)' }}>
      <Paper elevation={3} sx={{ p: 5, borderRadius: 4, minWidth: 350, textAlign: 'center', background: 'rgba(255,255,255,0.85)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#00c28c', fontWeight: 700 }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          This is a placeholder for the Settings page.<br />
          More features coming soon!
        </Typography>
        <Button
          variant="contained"
          sx={glassButtonStyle}
          onClick={() => navigate(ROUTES.DASHBOARD)}
        >
          Go to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default SettingsPage;
