// src/components/LogoOnly.tsx
import { Box, Typography } from '@mui/material';
import React from 'react';

// Reuse the same GreenDotI you had in Branding
const GreenDotI: React.FC<{ color?: string }> = ({ color }) => (
  <Typography
    component="span"
    variant="h4"
    sx={{
      fontWeight: 700,
      position: 'relative',
      display: 'inline-block',
      lineHeight: 1,
      color: color || 'inherit',
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

const LogoOnly: React.FC<{ color?: string }> = ({ color }) => (
  <Box sx={{ display: 'inline-flex', alignItems: 'center', mb: 2 }}>
    <Typography
      variant="h4"
      sx={{ fontWeight: 700, color: color || 'inherit', display: 'inline', mb: 0 }}
      component="span"
    >
      f
    </Typography>
    <GreenDotI color={color} />
    <Typography
      variant="h4"
      sx={{ fontWeight: 700, color: color || 'inherit', display: 'inline', mb: 0 }}
      component="span"
    >
      ll
    </Typography>
    <Typography
      component="span"
      color="primary"
      variant="h4"
      sx={{ fontWeight: 700, display: 'inline', mb: 0 }}
    >
      i
    </Typography>
    <Typography
      component="span"
      color="primary"
      variant="h4"
      sx={{ fontWeight: 700, display: 'inline', mb: 0 }}
    >
      t
    </Typography>
  </Box>
);

export default LogoOnly;
