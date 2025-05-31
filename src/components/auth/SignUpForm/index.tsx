// src/pages/SignUpForm.tsx
import React, { useState } from 'react';
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
import { SignUpTheme } from '../../../assets/themes/themes';
import { api } from '../../../utils/apis/apiconfig';
import { signUp, confirmSignUp, signOut, fetchAuthSession} from '@aws-amplify/auth';
import axios from 'axios';
import { Api } from '@mui/icons-material';

/* ──────────────────────────────────────────────
   Validation
   ────────────────────────────────────────────── */
const SignUpSchema = z
  .object({
    name:            z.string().nonempty('Name is required'),
    email:           z.string().email('Please enter a valid email address'),
    phone:           z.string().optional(),
    password:        z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    code:            z.string().optional(),   // 6-digit e-mail code
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignUpFormType = z.infer<typeof SignUpSchema>;   //  ← missing “>” fixed

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */
const SignUpForm: React.FC = () => {
  const navigate = useNavigate();

  const [snackOpen,    setSnackOpen]    = useState(false);
  const [authError,    setAuthError]    = useState<string | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingSignUpData, setPendingSignUpData]       = useState<SignUpFormType|null>(null);
  const [pendingEmployeeId, setPendingEmployeeId] = useState<number|undefined>(undefined);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignUpFormType>({ resolver: zodResolver(SignUpSchema) });


  /** 
 * Signs out **only if** there's currently a user signed in.
 */
async function clearSessionIfNeeded() {
  try {
    await fetchAuthSession();
    await signOut();
  } catch {
    // no user was signed in, nothing to do
  }
}

  /* ──────────────────────────────────────────
     Submit handler
     ────────────────────────────────────────── */
const onSubmit = async (data: SignUpFormType): Promise<void> => {
  setAuthError(null);
  setLoading(true);

  try {
    /* STEP 1 — persist user to your DB and grab the new employeeId */
    if (!awaitingCode) {
      const createRes = await api.post('/auth/sign-up', {
        name:     data.name,
        email:    data.email,
        phone:    data.phone,
        password: data.password,
      });
      const id = createRes.data.data.employee_id;

      /* STORE it for the confirm step (if needed) */
      setPendingEmployeeId(id);
      setPendingEmail(data.email);
      setPendingSignUpData(data);

      /* STEP 2 — sign up in Cognito, embedding the custom:employeeId */
      const { nextStep } = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email:              data.email,
            'custom:employeeId': String(id),
            ...(data.phone ? { phone_number: data.phone } : {}),
          },
        },
      });

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setAwaitingCode(true);
        return;
      }
      /* no confirmation required */
      setSnackOpen(true);
      
      await api.post('/auth/add-to-group', {
        email: data.email,
        group: 'Users',
      });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    /* STEP 3 — confirm code (nothing else to push) */
    const code = getValues('code')?.trim();
    if (!code) throw new Error('Please enter the verification code.');

    await confirmSignUp({
      username:         pendingEmail!,
      confirmationCode: code,
    });

    await clearSessionIfNeeded();
    setSnackOpen(true);

    await api.post('/auth/add-to-group', {
      email: data.email,
      group: 'Users',
    });
    setTimeout(() => navigate('/login'), 2000);
  }
  catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 409) {
      setAuthError('This email is already registered');
    } else if (err instanceof Error) {
      setAuthError(err.message);
    } else {
      setAuthError('Registration failed');
    }
    console.error('Sign-up flow error', err);
  }
  finally {
    setLoading(false);
  }
};

  /* dark-theme field styling */
  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#3a3f47',
      '& fieldset': { borderColor: 'grey.300' },
      '&:hover fieldset': { borderColor: 'primary.main' },
      '& input': { color: '#ffffff' },
    },
  } as const;

  return (
    <ThemeProvider theme={SignUpTheme}>
      <Box
        sx={{
          position: 'absolute', inset: 0,
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh', // Ensure it covers the full viewport height
          margin: 0,
          padding: 0,
        }}
      >
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
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              Create Account
            </Typography>
            <Typography variant="body1" align="center" color="grey.300" sx={{ mb: 4 }}>
              {awaitingCode
                ? `A 6-digit code was sent to ${pendingEmail}`
                : 'Fill in your details to get started'}
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={3}>
                {!awaitingCode ? (
                  <>
                    <TextField
                      label="Full Name" fullWidth {...register('name')}
                      error={!!errors.name} helperText={errors.name?.message}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label="Email" type="email" fullWidth {...register('email')}
                      error={!!errors.email} helperText={errors.email?.message}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label="Phone Number" type="tel" fullWidth {...register('phone')}
                      error={!!errors.phone} helperText={errors.phone?.message}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label="Password" type="password" fullWidth {...register('password')}
                      error={!!errors.password} helperText={errors.password?.message}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label="Confirm Password" type="password" fullWidth
                      {...register('confirmPassword')}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      sx={textFieldStyles}
                    />
                  </>
                ) : (
                  <TextField
                    label="6-digit Code" fullWidth {...register('code')}
                    error={!!errors.code} helperText={errors.code?.message}
                    sx={textFieldStyles}
                    inputProps={{ maxLength: 6 }}
                  />
                )}

                {authError && (
                  <Typography color="error" align="center">
                    {authError}
                  </Typography>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{ py: 1.5 }}
                  disabled={loading}
                >
                  {loading
                    ? awaitingCode ? 'Verifying…' : 'Signing up…'
                    : awaitingCode ? 'Verify'     : 'Sign Up'}
                </Button>
              </Stack>
            </form>

            {!awaitingCode && (
              <Button
                variant="text"
                color="primary"
                fullWidth
                sx={{ mt: 2, textTransform: 'none' }}
                component={RouterLink}
                to="/login"
              >
                Already have an account? Login
              </Button>
            )}
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
          Account verified — redirecting to login…
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default SignUpForm;
