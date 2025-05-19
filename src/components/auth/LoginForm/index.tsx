// src/pages/LoginForm.tsx

import React, { useState } from 'react';
import {
  Box, Button, Container, Paper,
  Stack, TextField, Typography
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import HomeIcon from '@mui/icons-material/Home';

import { instance } from '../../../utils/apis/apiconfig';
// Amplify Auth imports (v6)
import { signIn, fetchAuthSession } from '@aws-amplify/auth';
import { LoginTheme } from '../../../assets/themes/themes';

// ——— Zod schema —————————————————————————————————————————————————————
const LogInSchema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LogInForm = z.infer<typeof LogInSchema>;

export const LoginForm: React.FC = () => {
  const {
    register, handleSubmit, formState: { errors }
  } = useForm<LogInForm>({ resolver: zodResolver(LogInSchema) });

  const [ authError, setAuthError ] = useState<string|null>(null);
  const [ loading, setLoading ]     = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: LogInForm) => {
    setAuthError(null);
    setLoading(true);
    try {
      // Sign in with Cognito
      const { nextStep } = await signIn({
        username: data.email,
        password: data.password
      });

      if (nextStep.signInStep !== 'DONE') {
        throw new Error(`Unexpected signIn step: ${nextStep.signInStep}`);
      }

      //Fetch the access token
      const session = await fetchAuthSession();
      const token   = session.tokens?.accessToken;
      if (!token) throw new Error('Unable to retrieve access token');

      // // Call your EB backend with Bearer token
      // await api.post(
      //   '/api/employees',                           // your login (or auth‑check) endpoint
      //   {},                                 // no body needed
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );

      // On success, navigate to dashboard
      navigate('/user-dashboard', { replace: true });

    } catch (err: any) {
      console.error('Login flow error', err);
      setAuthError(
        // show Amplify or backend error, or a fallback
        err.response?.data?.message || err.message || 'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#3a3f47',
      '& fieldset': { borderColor: 'grey.300' },
      '&:hover fieldset': { borderColor: 'primary.main' },
      '& input': { color: '#ffffff' },
    },
  } as const;

  return (
    <ThemeProvider theme={LoginTheme}>
      <Box sx={{
        position: 'absolute', inset: 0,
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center', 
        justifyContent: 'center'
      }}>
        <Button
          component={RouterLink} to="/"
          startIcon={<HomeIcon />}
          variant="text" color="primary"
          sx={{ position: 'absolute', top: 24, left: 24, textTransform: 'none' }}
        >Home</Button>

        <Container
          maxWidth="sm"
          sx={{
            '@media (max-width: 600px)': {
              bgcolor: 'transparent', // Transparent on mobile
              border: 'none', // No border on mobile
              p: 0, // Remove padding on mobile
            },
          }}
        >
          <Paper
            elevation={0} // Remove shadow
            sx={{
              p: 4,
              borderRadius: 8,
              bgcolor: 'background.paper',
              color: 'white',
              '@media (max-width: 600px)': {
                bgcolor: 'transparent', // Transparent on mobile
                border: 'none', // No border on mobile
                boxShadow: 'none', // Remove shadow on mobile
              },
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

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={3}>
                <TextField
                  label="Email" type="email" fullWidth variant="outlined"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={textFieldStyles}
                />

                <TextField
                  label="Password" type="password" fullWidth variant="outlined"
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={textFieldStyles}
                />

                {authError && (
                  <Typography color="error" align="center">
                    {authError}
                  </Typography>
                )}

                <Button
                  type="submit"
                  variant="contained" color="primary"
                  size="large" fullWidth
                  sx={{ py: 1.5 }}
                  disabled={loading}
                >
                  {loading ? 'Signing in…' : 'Login'}
                </Button>
              </Stack>
            </form>

            <Button
              variant="text" color="primary" fullWidth
              sx={{ mt: 2, textTransform: 'none' }}
              component={RouterLink} to="/signup"
            >
              Still don't have an account? Sign Up
            </Button>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default LoginForm;