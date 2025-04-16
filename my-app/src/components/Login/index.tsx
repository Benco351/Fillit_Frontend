import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Paper, Stack } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00c28c', // Green color from Fillit logo
      dark: '#009e6f',
      light: '#33cf9f',
    },
    secondary: {
      main: '#2c353d', // Dark gray background from Fillit logo
    },
    background: {
      default: '#2c353d', // Dark gray for the entire page
      paper: '#3a3f47', // Lighter gray for the form bubble
    },
    grey: {
      50: '#f9fafb',
      100: '#f2f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      800: '#2c353d', // Dark gray
    },
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
    },
  },
  shape: {
    borderRadius: 12,
  },
});

const LogInPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateName = (name: string): boolean => {
    const isValid = name.trim().length > 0;
    setNameError(isValid ? '' : 'Name is required');
    console.log('Validating name:', name, isValid ? 'Valid' : 'Invalid');
    return isValid;
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = re.test(email);
    setEmailError(isValid ? '' : 'Please enter a valid email address');
    console.log('Validating email:', email, isValid ? 'Valid' : 'Invalid');
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = password.trim().length > 0;
    const isConfirmPasswordValid = confirmPassword === password;

    setPasswordError(isPasswordValid ? '' : 'Password is required');
    setConfirmPasswordError(
      isConfirmPasswordValid ? '' : 'Passwords do not match'
    );

    console.log('Submitting form:', {
      name,
      email,
      password,
      confirmPassword,
      isNameValid,
      isEmailValid,
      isPasswordValid,
      isConfirmPasswordValid,
    });

    if (isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
      console.log('Form submitted successfully');
    } else {
      console.log('Form submission failed');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          position: 'absolute', // Ensure the box spans the entire viewport
          top: 0,
          left: 0,
          bgcolor: 'background.default', // Dark gray background for the entire page
          minHeight: '100vh',
          minWidth: '100vw', // Ensure the background spans the full width
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0, // Remove any default margin
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 8, // Make the box more rectangular
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
              bgcolor: 'background.paper', // Lighter gray for the form bubble
              color: 'white', // White text for contrast
            }}
          >
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{ fontWeight: 700, color: 'primary.main' }}
            >
              Login
            </Typography>
            <Typography
              variant="body1"
              align="center"
              color="grey.300" // Light gray text for subtitle
              sx={{ mb: 4 }}
            >
              Fill in your details to get started
            </Typography>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
               
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => validateEmail(email)}
                  error={!!emailError}
                  helperText={emailError}
                  InputLabelProps={{ style: { color: 'white' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'grey.300',
                      },
                      '&:hover fieldset': {
                        borderColor: 'grey.300',
                      },
                    },
                  }}
                />
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!passwordError}
                  helperText={passwordError}
                  InputLabelProps={{ style: { color: 'white' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'grey.300',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Login
                </Button>
              </Stack>
            </form>
            <Typography
              variant="body2"
              align="center"
              color="grey.300" // Light gray text for footer
              sx={{ mt: 3 }}
            >
              By signing up, you agree to our{' '}
              <Typography
                component="span"
                color="primary"
                sx={{ textDecoration: 'underline', cursor: 'pointer' }}
              >
                Terms of Service
              </Typography>{' '}
              and{' '}
              <Typography
                component="span"
                color="primary"
                sx={{ textDecoration: 'underline', cursor: 'pointer' }}
              >
                Privacy Policy
              </Typography>
              .
            </Typography>
            <Button
              variant="text"
              color="primary"
              fullWidth
              sx={{ mt: 2, textTransform: 'none' }}
              component={RouterLink}
              to="/signup" // Ensure this matches the route defined in your router configuration
            >
              Still don't have an account? Click here to Sign Up
            </Button>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default LogInPage;