// src/App.tsx
import AppRoutes from '../Routers';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {AppBar, Box, Button, Card, CardContent, Container, CssBaseline, Grid, IconButton,
  Paper,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
  useMediaQuery,
  useScrollTrigger,
  alpha
} from '@mui/material';
import {Chat, DateRange, MenuOutlined, Notifications,Psychology, SwapHoriz, Map, ArrowForward, Check,
  CheckCircleSharp
} from '@mui/icons-material';
import { AppBarProps } from '@mui/material/AppBar';
import Footer from '../Footer';
import HeroWave from '../HeroWave';
import WhyChooseUs from '../WhyChooseUs';
import Features from '../Features';
import Navbar from '../Navbar';

// Create a custom theme with Fillit colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#00c28c', // Green color from Fillit logo
      dark: '#009e6f',
      light: '#33cf9f'
    },
    secondary: {
      main: '#2c353d', // Dark background from Fillit logo
      dark: '#232a31',
      light: '#4e5a64'
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    }
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          padding: '10px 24px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
  },
});

// Landing Page Component
const LandingPage: React.FC = () => {

  return (
    <>
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* NavBar section */}
      <Navbar/>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          bgcolor: 'secondary.main',
          color: 'white',
          overflow: 'hidden',
          pt: { xs: 20, md: 25 },
          pb: { xs: 15, md: 20 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
              <Typography
                variant="h1"
                gutterBottom
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                  mb: 3,
                }}
              >
                Simplify Your <Typography component="span" color="primary" variant="inherit">Shift Management</Typography>
              </Typography>
              <Typography
                variant="h6"
                paragraph
                sx={{
                  mb: 4,
                  fontWeight: 400,
                  opacity: 0.9,
                  maxWidth: '600px',
                }}
              >
                Streamline scheduling, enhance communication, and automate shift-matching with our intelligent cloud-based platform.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ 
                    py: 1.5,
                    px: 4,
                    fontWeight: 600
                  }}
                >
                  Get Started Free
                </Button>
 
              </Stack>
            
              <Box
                component="img"
                src="/fillit.png"
                alt="Fillit App Dashboard"
                sx={{
                  width: '40%',
                  maxWidth: '600px',
                  borderRadius: 3,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  transform: 'perspective(1000px) rotateY(-10deg) rotateX(5deg)',
                  border: '8px solid rgba(255,255,255,0.1)',
                }}
              />
          </Grid>
        </Container>
        <HeroWave />
      </Box>
      
      {/* Features Section */}
      <Features/>
      
      <WhyChooseUs/>
     
      
      {/* Footer */}
      <Footer/>
    </ThemeProvider>
  </>
  );
};

export default LandingPage;