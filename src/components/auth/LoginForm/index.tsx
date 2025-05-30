import React, { useState, useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import HomeIcon from '@mui/icons-material/Home';

import {
  signIn,
  fetchAuthSession,
  resetPassword,
  confirmResetPassword,
  fetchUserAttributes,
  signOut, // add this import
} from '@aws-amplify/auth';
import { LoginTheme } from '../../../assets/themes/themes';
import axios from 'axios';
import { api } from '../../../utils/apis/apiconfig';
import { se } from 'date-fns/locale';

/* ────────────────────────────────────────────────────────────
   Zod validation schemas
   ──────────────────────────────────────────────────────────── */
const LoginSchema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const ResetRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const ResetConfirmSchema = z.object({
  code:               z.string().length(6, '6-digit code'),
  newPassword:        z.string().min(8, 'Password must be at least 8 characters'),
  confirmNewPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});

type LoginFormData        = z.infer<typeof LoginSchema>;
type ResetRequestData     = z.infer<typeof ResetRequestSchema>;
type ResetConfirmData     = z.infer<typeof ResetConfirmSchema>;

type Mode = 'login' | 'resetRequest' | 'resetConfirm';
type AnyFormData = LoginFormData | ResetRequestData | ResetConfirmData;

/* ────────────────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────────────────── */
const LoginForm: React.FC = () => {
  const navigate = useNavigate();

  const [mode, setMode]               = useState<Mode>('login');
  const [emailForReset, setEmail]     = useState('');
  const [loading, setLoading]         = useState(false);
  const [authError, setAuthError]     = useState<string | null>(null);
  const [snackOpen, setSnackOpen]     = useState(false);

  /* pick schema per mode */
  const schema = useMemo(() => {
    switch (mode) {
      case 'resetRequest': return ResetRequestSchema;
      case 'resetConfirm': return ResetConfirmSchema;
      default:             return LoginSchema;
    }
  }, [mode]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AnyFormData>({
    resolver: zodResolver(schema as z.ZodType<AnyFormData>),  // ← cast added
  });
  /* ────────────────────────────
     Submit handler (all modes)
     ──────────────────────────── */
  const onSubmit = async (form: any): Promise<void> => {
    setAuthError(null);
    setLoading(true);

    try {
      /* 1 ► sign-in */
      if (mode === 'login') {
        const data = form as LoginFormData;
        const result = await signIn({
          username: data.email,
          password: data.password,
        });

        if (!result.isSignedIn) {
          throw new Error(`Unexpected next step: ${result.nextStep.signInStep}`);
        }

        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken;
        if (!token) throw new Error('Unable to retrieve access token');

        // Retrieve current user and fetch its attributes
        const attributes = await fetchUserAttributes();
        let customEmployeeId: string | undefined = undefined;
        if (Array.isArray(attributes)) {
          customEmployeeId = attributes.find(attr => attr.Name === 'custom:employeeId')?.Value;
        } else if (typeof attributes === 'object' && attributes !== null && 'custom:employeeId' in attributes) {
          // If fetchUserAttributes returns an object (key-value map)
          customEmployeeId = (attributes as Record<string, string>)['custom:employeeId'];
        }

        if (!customEmployeeId) {
          throw new Error('Unable to retrieve custom employee ID');
        }

        // Print the logged in customEmployeeId
        console.log('Logged in customEmployeeId:', customEmployeeId);

        // Retrieve if admin from back
        const response = await api.get(`/api/employees/${customEmployeeId}`);
        console.log('Employee data:', response.data);
        const isAdmin = response.data.data.employee_admin;

        // Save customEmployeeId and isAdmin in sessionStorage
        sessionStorage.setItem('customEmployeeId', customEmployeeId);
        sessionStorage.setItem('isAdmin', JSON.stringify(isAdmin));
        sessionStorage.setItem('name', response.data.data.employee_name);
        sessionStorage.setItem('email', response.data.data.employee_email);

        console.log('Session storage updated:', {
          customEmployeeId,
          isAdmin,
          name: response.data.employee_name,
          email: response.data.email,
        });

        if (isAdmin) {
          navigate('/admin-dashboard', { replace: true });
        } else {
          navigate('/user-dashboard', { replace: true });
        }
      }
      /* 2 ► forgot-password: request code */
      else if (mode === 'resetRequest') {
        const data = form as ResetRequestData;
        const { nextStep } = await resetPassword({ username: data.email });

        if (nextStep.resetPasswordStep !== 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
          throw new Error('Unexpected reset-password step');
        }
        setEmail(data.email);
        reset();
        setMode('resetConfirm');
      }
      /* 3 ► forgot-password: confirm code */
      else if (mode === 'resetConfirm') {
        const data = form as ResetConfirmData;
        await confirmResetPassword({
          username:         emailForReset,
          confirmationCode: data.code,
          newPassword:      data.newPassword,
        });

        setSnackOpen(true);
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    } catch (err: unknown) {
      console.error('Auth flow error', err);
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setAuthError(err.response.data.message);
      } else if (err instanceof Error) {
        setAuthError(err.message);
      } else {
        setAuthError('Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  /* helper to switch view */
  const switchMode = (m: Mode) => {
    setAuthError(null);
    reset();
    setMode(m);
  };

  /* dark-field styling */
  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#3a3f47',
      '& fieldset': { borderColor: 'grey.300' },
      '&:hover fieldset': { borderColor: 'primary.main' },
      '& input': { color: '#ffffff' },
    },
  } as const;

  /* TS helper to silence strict field-errors for conditional forms */
  const fieldError = errors as any;

  return (
    <ThemeProvider theme={LoginTheme}>
      <Box sx={{
        position: 'absolute', inset: 0, bgcolor: 'background.default',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Button
          component={RouterLink} to="/"
          startIcon={<HomeIcon />}
          variant="text" color="primary"
          sx={{ position: 'absolute', top: 24, left: 24, textTransform: 'none' }}
        >
          Home
        </Button>

        <Container maxWidth="sm">
          <Paper elevation={3} sx={{
            p: 4, borderRadius: 8, bgcolor: 'background.paper', color: 'white',
            '@media (max-width:600px)': { bgcolor: 'transparent', boxShadow: 'none' },
          }}>
            <Typography variant="h4" align="center" gutterBottom
              sx={{ fontWeight: 700, color: 'primary.main' }}
            >
              {mode === 'login'        && 'Login'}
              {mode === 'resetRequest' && 'Forgot password'}
              {mode === 'resetConfirm' && 'Reset password'}
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={3}>
                {/* email shown in login & resetRequest */}
                {mode !== 'resetConfirm' && (
                  <TextField
                    label="Email" type="email" fullWidth variant="outlined"
                    {...register('email')}
                    error={!!fieldError.email}
                    helperText={fieldError.email?.message}
                    sx={textFieldStyles}
                  />
                )}

                {mode === 'login' && (
                  <TextField
                    label="Password" type="password" fullWidth variant="outlined"
                    {...register('password')}
                    error={!!fieldError.password}
                    helperText={fieldError.password?.message}
                    sx={textFieldStyles}
                  />
                )}

                {mode === 'resetConfirm' && (
                  <>
                    <TextField
                      label="6-digit code" fullWidth variant="outlined"
                      {...register('code')}
                      inputProps={{ maxLength: 6 }}
                      error={!!fieldError.code}
                      helperText={fieldError.code?.message}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label="New password" type="password" fullWidth variant="outlined"
                      {...register('newPassword')}
                      error={!!fieldError.newPassword}
                      helperText={fieldError.newPassword?.message}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label="Confirm new password" type="password" fullWidth variant="outlined"
                      {...register('confirmNewPassword')}
                      error={!!fieldError.confirmNewPassword}
                      helperText={fieldError.confirmNewPassword?.message}
                      sx={textFieldStyles}
                    />
                  </>
                )}

                {authError && (
                  <Typography color="error" align="center">{authError}</Typography>
                )}

                <Button
                  type="submit"
                  variant="contained" color="primary"
                  size="large" fullWidth disabled={loading}
                  sx={{ py: 1.5 }}
                >
                  {loading
                    ? mode === 'login'        ? 'Signing in…'
                    : mode === 'resetRequest' ? 'Sending code…'
                    :                             'Resetting…'
                    : mode === 'login'        ? 'Login'
                    : mode === 'resetRequest' ? 'Send reset code'
                    :                             'Set new password'}
                </Button>
              </Stack>
            </form>

            {/* footer links */}
            <Stack direction="row" justifyContent="space-between" mt={2}>
              {mode !== 'login' ? (
                <Button variant="text" color="primary" onClick={() => switchMode('login')}>
                  Back to login
                </Button>
              ) : (
                <Button variant="text" color="primary" onClick={() => switchMode('resetRequest')}>
                  Forgot password?
                </Button>
              )}

              {mode === 'login' && (
                <Button variant="text" color="primary" component={RouterLink} to="/signup">
                  Need an account? Sign Up
                </Button>
              )}
            </Stack>
          </Paper>
        </Container>
      </Box>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Password reset successfully — please log in.
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default LoginForm;