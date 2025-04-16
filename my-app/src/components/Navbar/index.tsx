import {
  AppBar, AppBarProps, Box, Button, Container,
  IconButton,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
  useMediaQuery,
  useScrollTrigger,

} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  MenuOutlined
} from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import { alpha } from '@mui/system';
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

const ElevationScroll = (props: { children: React.ReactElement<AppBarProps> }) => {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
    style: {
      backgroundColor: trigger ? theme.palette.background.paper : 'transparent',
      boxShadow: trigger ? undefined : 'none',
      color: trigger ? theme.palette.text.primary : theme.palette.common.white,
      ...(children.props.style || {}),
    },
  });
}


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <ElevationScroll>
        <AppBar
          position="fixed"
          color="transparent"
          sx={{
            transition: 'all 0.3s',
            backdropFilter: scrolled ? 'blur(10px)' : 'none',
            backgroundColor: scrolled ? alpha(theme.palette.background.paper, 0.8) : 'transparent',
          }}
        >
          <Container>
            <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    color: scrolled ? theme.palette.primary.main : 'white'
                  }}
                >
                  f<Typography component="span" color="primary" variant="h4" sx={{ fontWeight: 700 }}>i</Typography>ll<Typography component="span" color="primary" variant="h4" sx={{ fontWeight: 700 }}>i</Typography>t
                </Typography>
              </Box>

              {isMobile ? (
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <MenuOutlined />
                </IconButton>
              ) : (
                <Box sx={{ display: 'flex', gap: 3 }}>


                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ ml: 2 }}
                    component={RouterLink}
                    to="/login"  // This is where it routes to
                  >

                    Login
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ ml: 2 }}
                    component={RouterLink}
                    to="/signup"  // This is where it routes to
                  >

                    SignUp
                  </Button>
                </Box>
              )}
            </Toolbar>
          </Container>
        </AppBar>
      </ElevationScroll>
    </ThemeProvider>
  );
}
export default Navbar;