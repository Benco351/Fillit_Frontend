import { Check, ArrowForward } from '@mui/icons-material';
import {AppBar, Box, Button, Card, CardContent, Container, CssBaseline,
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
 
} from '@mui/material';
import { alpha } from '@mui/system';

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


const LoginPage = () => (


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
        THIS IS THE LOGIN PAGE
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
 
);

export default LoginPage;
export{};


