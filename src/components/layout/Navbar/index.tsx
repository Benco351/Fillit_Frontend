import {
  AppBar, AppBarProps, Box, Button, Container,
  IconButton, ThemeProvider, Toolbar, Typography,
  useMediaQuery, useScrollTrigger,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  MenuOutlined
} from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import { alpha } from '@mui/system';
import LogoOnly from '../../common/Logo';
import { NavBarTheme } from '../../../assets/themes/themes';
import { ROUTES } from '../../../routes/config/routes';
import MobileDrawer from './MobileDrawer';

const ElevationScroll = (props: { children: React.ReactElement<AppBarProps> }) => {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
    style: {
      backgroundColor: trigger ? NavBarTheme.palette.background.paper : 'transparent',
      boxShadow: trigger ? undefined : 'none',
      color: trigger ? NavBarTheme.palette.text.primary : NavBarTheme.palette.common.white,
      ...(children.props.style || {}),
    },
  });
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useMediaQuery(NavBarTheme.breakpoints.down('md'));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ThemeProvider theme={NavBarTheme}>
      <ElevationScroll>
        <AppBar
          position="fixed"
          color="transparent"
          sx={{
            transition: 'all 0.3s',
            backdropFilter: scrolled ? 'blur(10px)' : 'none',
            backgroundColor: scrolled ? alpha(NavBarTheme.palette.background.paper, 0.8) : 'transparent',
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
                    color: scrolled ? NavBarTheme.palette.primary.main : 'white',
                  }}
                >
                  {/* Logo Section */}
                  <LogoOnly />
                </Typography>
              </Box>

              {isMobile ? (
                <>
                  <IconButton
                    edge="end"
                    color="inherit"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <MenuOutlined />
                  </IconButton>
                  <MobileDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ ml: 2 }}
                    component={RouterLink}
                    to="/login"
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ ml: 2 }}
                    component={RouterLink}
                    to="/signup"
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
};

export default Navbar;







