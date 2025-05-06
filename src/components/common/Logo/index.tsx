// src/components/LogoOnly.tsx
import { Box, Typography } from '@mui/material';
import React from 'react';

// Reuse the same GreenDotI you had in Branding
const GreenDotI: React.FC = () => (
    <Typography
      component="span"
      variant="h4"
      sx={{
        fontWeight: 700,
        position: 'relative',
        display: 'inline-block',
        lineHeight: 1,
      }}
    >
      {'\u0131'}
      <Box
        component="span"
        sx={{
          position: 'absolute',
          top: '0.1em',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '0.15em',
          height: '0.15em',
          borderRadius: '50%',
          backgroundColor: 'primary.main',
        }}
      />
    </Typography>
  );

const LogoOnly = () => (
    <Typography
    variant="h4"
    sx={{ fontWeight: 700, mb: 2 }}
    >
    f
    <GreenDotI />
    ll
    <Typography component="span" color="primary" variant="h4" sx={{ fontWeight: 700 }}>i</Typography>
    <Typography component="span" color="primary" variant="h4" sx={{ fontWeight: 700 }}>t</Typography>
    </Typography>
);

export default LogoOnly;
