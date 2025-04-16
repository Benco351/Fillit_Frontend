import React from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginTheme } from '../../assets/themes/themes';
import HomeIcon from '@mui/icons-material/Home';

// ----------------------
// Validation Schema
// ----------------------
const LogInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LogInForm = z.infer<typeof LogInSchema>;

// ----------------------
// Component
// ----------------------
const LogInPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LogInForm>({ resolver: zodResolver(LogInSchema) });

  const onSubmit = (data: LogInForm) => {
    console.log('Login form submitted:', data);
  };

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#3a3f47',          // keep the white field background (optional)
      '& fieldset': { borderColor: 'grey.300' },
      '&:hover fieldset': { borderColor: 'primary.main' },
      '& input': { color: '#ffffff' },     // NEW ─ input characters rendered in white
    },
  } as const;

  return (
    <ThemeProvider theme={LoginTheme}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
         {/* Home button */}
        <Button
          component={RouterLink}
          to="/"
          startIcon={<HomeIcon />}
          variant="text"
          color="primary"
          sx={{ position: 'absolute', top: 24, left: 24, textTransform: 'none' }}
        >
          Home
        </Button>
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 8, bgcolor: 'background.paper', color: 'white' }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              Login
            </Typography>
            <Typography variant="body1" align="center" color="grey.300" sx={{ mb: 4 }}>
              Fill in your details to get started
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={3}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  variant="outlined"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={textFieldStyles}
                />

                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={textFieldStyles}
                />

                <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ py: 1.5 }}>
                  Login
                </Button>
              </Stack>
            </form>
            <Button
              variant="text"
              color="primary"
              fullWidth
              sx={{ mt: 2, textTransform: 'none' }}
              component={RouterLink}
              to="/signup"
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
