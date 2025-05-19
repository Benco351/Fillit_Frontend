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
import {instance} from '../../../utils/apis/apiconfig'
import {
  signUp,
  updateUserAttributes,
} from '@aws-amplify/auth';
import axios from 'axios';

// validation schema
const SignUpSchema = z
  .object({
    name:            z.string().nonempty('Name is required'),
    email:           z.string().email('Please enter a valid email address'),
    phone:           z.string().optional(),
    password:        z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignUpFormType = z.infer<typeof SignUpSchema>;

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const [snackOpen, setSnackOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);

  const { register, handleSubmit, formState: { errors } } =
    useForm<SignUpFormType>({ resolver: zodResolver(SignUpSchema) });

  const onSubmit = async (data: SignUpFormType) => {
    setAuthError(null);
    setLoading(true);

    try {
      // 1) Persist in RDS via your backend
      const createRes = await instance.post('/api/employees', {
        name:  data.name,
        email: data.email,
        phone: data.phone,
      });
      console.log('RDS create response:', createRes.data);
      const employeeId = createRes.data.data.employee_id;

      // 2) Cognito sign-up
      const { nextStep } = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            name:  data.name,
            ...(data.phone ? { phone_number: data.phone } : {}),
          },
        },
      });
      if (nextStep.signUpStep !== 'DONE') {
        console.warn('Unexpected signUp step:', nextStep);
        throw new Error(`signUp step: ${nextStep.signUpStep}`);
      }

  
      // 4) Store RDS ID in Cognito custom attribute
      await updateUserAttributes({
        userAttributes: { 'custom:employeeId': String(employeeId) }
      });
      // 5) Success → show snack, then redirect
      setSnackOpen(true);
      setTimeout(() => navigate('/login'), 2000);

    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setAuthError('This email is already registered');
      } else {
        console.error('Sign-up flow error', err);
        setAuthError(err.message || 'Registration failed');
      }
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
              Fill in your details to get started
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={3}>
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
                  label="Confirm Password" type="password" fullWidth {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  sx={textFieldStyles}
                />

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
                  {loading ? 'Signing up…' : 'Sign Up'}
                </Button>
              </Stack>
            </form>

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
          Account created successfully — redirecting to login…
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default SignUpForm;
