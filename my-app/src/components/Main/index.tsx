import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  CssBaseline,
  Grid,
  IconButton,
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
import {
  Chat,
  DateRange,
  MenuOutlined,
  Notifications,
  Psychology,
  SwapHoriz,
  Map,
  ArrowForward,
  Check,
  CheckCircleSharp
} from '@mui/icons-material';
import { AppBarProps } from '@mui/material/AppBar';
import Footer from '../Footer';

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

function ElevationScroll(props: { children: React.ReactElement<AppBarProps> }) {
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

// Feature data
const features = [
  {
    icon: <DateRange fontSize="large" color="primary" />,
    title: "Smart Calendar",
    description: "View and manage shifts with our interactive calendar that displays dates, hours, and employee assignments."
  },
  {
    icon: <CheckCircleSharp fontSize="large" color="primary" />,
    title: "ChatGPT Integration",
    description: "View and manage shifts with our interactive calendar that displays dates, hours, and employee assignments."
  },
  {
    icon: <Chat fontSize="large" color="primary" />,
    title: "Integrated Chat",
    description: "Communicate seamlessly with P2P and group chats for quick team coordination and updates."
  },
  {
    icon: <SwapHoriz fontSize="large" color="primary" />,
    title: "Easy Shift Switch",
    description: "Exchange shifts with colleagues easily with automated approval workflows."
  },
  {
    icon: <Psychology fontSize="large" color="primary" />,
    title: "AI Assistant",
    description: "Get intelligent scheduling recommendations and shift suggestions from our AI-powered assistant."
  },
  {
    icon: <Map fontSize="large" color="primary" />,
    title: "Location Mapping",
    description: "View and select shift locations with our integrated Google Maps feature."
  },
  {
    icon: <Notifications fontSize="large" color="primary" />,
    title: "Push Notifications",
    description: "Stay updated with instant alerts about schedule changes and shift reminders."
  },
];

// Hero wave SVG
const HeroWave = () => (
  <Box
    sx={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      overflow: 'hidden',
      lineHeight: 0,
      transform: 'rotate(180deg)',
      zIndex: 0,
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      style={{
        position: 'relative',
        display: 'block',
        width: 'calc(100% + 1.3px)',
        height: '80px',
      }}
    >
      <path
        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
        fill="#ffffff"
      />
    </svg>
  </Box>
);

// Landing Page Component
const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Navbar */}
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
                  <Button color="inherit">Features</Button>
                  <Button color="inherit">Pricing</Button>
                  <Button color="inherit">About Us</Button>
                  <Button color="inherit">Contact</Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ ml: 2 }}
                  >
                    Login
                  </Button>
                </Box>
              )}
            </Toolbar>
          </Container>
        </AppBar>
      </ElevationScroll>
      
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
                <Button
                  variant="outlined"
                  sx={{ 
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: alpha('#ffffff', 0.1)
                    },
                    py: 1.5,
                    px: 4,
                  }}
                >
                  Watch Demo
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
      <Container sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 600 
            }}
          >
            Powerful Features
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              maxWidth: '700px',
              mx: 'auto',
              fontWeight: 400,
            }}
          >
            Everything you need to manage shifts efficiently in one place
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 2,
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography gutterBottom variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
          ))}
        </Grid>
      </Container>
      
      {/* Why Choose Us Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 12 } }}>
        <Container>
          <Grid container spacing={6} alignItems="center">
            
              <Box
                component="img"
                src="/fillit.png"
                alt="Fillit App in Action"
                sx={{
                  width: '10%',
                  borderRadius: 3,
                  boxShadow: theme.shadows[10],
                }}
              />
              <Typography>
                Why Choose Fillit?
              </Typography>
              <Typography paragraph color="text.secondary">
                Our platform streamlines shift management like never before, addressing the challenges of disorganized communication and manual scheduling.
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    }}
                  >
                    <Check color="primary" sx={{ mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Inspired by Real Needs
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Born from volunteer experience at Magen David Adom, we understand the challenges of shift management in non-profit organizations.
                      </Typography>
                    </Box>
                  </Paper>
                
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    }}
                  >
                    <Check color="primary" sx={{ mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Cutting-Edge Technology
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Built on AWS cloud infrastructure with AI-powered assistance for intelligent shift-matching and scheduling.
                      </Typography>
                    </Box>
                  </Paper>
                
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    }}
                  >
                    <Check color="primary" sx={{ mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Customizable & Scalable
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Adaptable organizational templates and scalable infrastructure to grow with your organization's needs.
                      </Typography>
                    </Box>
                  </Paper>
              </Grid>
              
              <Button 
                variant="contained" 
                color="primary"
                size="large"
                endIcon={<ArrowForward />}
                sx={{ mt: 4 }}
              >
                Learn More
              </Button>
          </Grid>
        </Container>
      </Box>
      
      {/* Pricing Section
      <Container sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 600 
            }}
          >
            Simple, Transparent Pricing
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              maxWidth: '700px',
              mx: 'auto',
              fontWeight: 400,
            }}
          >
            Choose the plan that works best for your organization
          </Typography>
        </Box>
        
        <Grid container spacing={4} justifyContent="center">
          {pricingPlans.map((plan, index) => (
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 3,
                  ...(plan.highlighted && {
                    border: `2px solid ${theme.palette.primary.main}`,
                    transform: { md: 'scale(1.05)' },
                    position: 'relative',
                  })
                }}
              >
                {plan.highlighted && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderRadius: 10,
                      px: 2,
                      py: 0.5,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    Popular
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                    {plan.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                    <Typography variant="h3" component="span" sx={{ fontWeight: 700 }}>
                      {plan.price}
                    </Typography>
                    <Typography variant="body1" component="span" color="text.secondary">
                      {plan.period}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mt: 3 }}>
                    {plan.features.map((feature, featureIndex) => (
                      <Box 
                        key={featureIndex} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 1.5 
                        }}
                      >
                        <Check 
                          fontSize="small" 
                          sx={{ 
                            mr: 1.5, 
                            color: plan.highlighted ? 'primary.main' : 'success.main'
                          }} 
                        />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button 
                    variant={plan.highlighted ? "contained" : "outlined"}
                    color={plan.highlighted ? "primary" : "primary"}
                    fullWidth
                    size="large"
                  >
                    {plan.highlighted ? "Get Started" : "Choose Plan"}
                  </Button>
                </Box>
              </Card>
          ))}
        </Grid>
      </Container> */}
      
      {/* CTA Section
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          py: { xs: 8, md: 10 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            opacity: 0.1,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 2px, transparent 2px)',
            backgroundSize: '40px 40px',
            zIndex: 0,
          }}
        />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h2" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 700,
                mb: 3, 
              }}
            >
              Ready to Optimize Your Shift Management?
            </Typography>
            <Typography 
              variant="h6"
              sx={{ 
                mb: 5,
                opacity: 0.9,
                fontWeight: 400,
              }}
            >
              Join thousands of organizations who've simplified their scheduling.
              Get started with a free trial today.
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3}
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                sx={{ 
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, 0.9),
                  },
                  py: 1.5,
                  px: 4,
                  fontWeight: 600
                }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ 
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: alpha('#ffffff', 0.1)
                  },
                  py: 1.5,
                  px: 4,
                }}
              >
                Request Demo
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box> */}
      
      {/* Footer */}
      <Footer/>
    </ThemeProvider>
  );
};

export default LandingPage;