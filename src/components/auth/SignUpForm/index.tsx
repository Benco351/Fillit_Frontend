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
import { deleteEmployeeById } from '../../../utils/apis/employeeShiftApis';
import { signUp, confirmSignUp, signOut, fetchAuthSession } from '@aws-amplify/auth';
import axios from 'axios';

/* ──────────────────────────────────────────────
   Validation
   ────────────────────────────────────────────── */
const SignUpSchema = z
  .object({
    name: z.string().nonempty('Name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string()
      .optional()
      .refine((phone) => {
        if (!phone) return true; // Optional field
        // Phone must start with + and be in international format
        const cleanPhone = phone.replace(/[\s\-()]/g, '');
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        return phoneRegex.test(cleanPhone);
      }, 'Phone number must start with + and be in international format (e.g., +1234567890)'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one digit')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must have at least one symbol character'),
    confirmPassword: z.string(),
    code: z.string().optional(),   // 6-digit e-mail code
    organizationId: z.coerce.number({ invalid_type_error: 'Organization ID must be a number' })
      .int('Organization ID must be an integer'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignUpFormType = z.infer<typeof SignUpSchema>;   //  ← missing ">" fixed

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */
const SignUpForm: React.FC = () => {
  const navigate = useNavigate();

  const [snackOpen, setSnackOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  // Removed unused pendingSignUpData and setPendingSignUpData
  // Removed unused pendingEmployeeId and setPendingEmployeeId

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

  /**
   * Validates if organization exists by attempting to create a test employee
   * This is a lightweight way to check organization validity
   */

  /**
   * Cleans up employee record if Cognito signup fails
   */
  async function cleanupEmployeeRecord(employeeId: number) {
    try {
      console.log(`Cleaning up employee record with ID: ${employeeId}`);
      await deleteEmployeeById(employeeId);
      console.log('Employee record successfully deleted');
    } catch (error) {
      console.error('Failed to cleanup employee record:', error);
      // Don't throw here - we want to show the original Cognito error to the user
    }
  }

  /* ──────────────────────────────────────────
     Submit handler
     ────────────────────────────────────────── */
  const onSubmit = async (data: SignUpFormType): Promise<void> => {
    setAuthError(null);
    setLoading(true);

    try {
      // Validate organizationId
      const orgId = Number(data.organizationId);
      if (!orgId || isNaN(orgId) || orgId <= 0) {
        throw new Error('A valid organization ID is required to sign up.');
      }
      /* STEP 1 — persist user to your DB and grab the new employeeId */
      if (!awaitingCode) {
        let employeeId: number | undefined = undefined;

        try {
          const createRes = await api.post('/auth/sign-up', {
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: data.password,
            organization_id: orgId,
            // initial: false,
          });
          employeeId = createRes.data.data.employee_id;
          // Check if the employee is admin from the response
          const isAdmin = createRes.data.data.employee_admin;
          /* STORE it for the confirm step (if needed) */
          setPendingEmail(data.email);

          // --- Cognito signUp code ---
          const { nextStep } = await signUp({
            username: data.email,
            password: data.password,
            options: {
              userAttributes: {
                email: data.email,
                'custom:employeeId': String(employeeId),
                ...(data.phone ? { phone_number: data.phone } : {}),
              },
            },
          });

          if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
            setAwaitingCode(true);
            return;
          }

          // /* no confirmation required */
          setSnackOpen(true);
          await api.post('/auth/add-to-group', {
            email: data.email,
            group: isAdmin ? 'Admins' : 'Users',
          });
          setTimeout(() => navigate('/login'), 2000);
          return;

        } catch (cognitoError) {
          // If Cognito signup fails, clean up the employee record
          if (employeeId !== undefined) {
            await cleanupEmployeeRecord(employeeId);
          }

          // Re-throw the Cognito error to be handled by the outer catch block
          throw cognitoError;
        }
      }

      /* STEP 3 — confirm code (nothing else to push) */
      const code = getValues('code')?.trim();
      if (!code) throw new Error('Please enter the verification code.');
      await confirmSignUp({
        username: pendingEmail || '',
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
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.message || err.message;
        if (status === 409) {
          setAuthError('This email is already registered');
        } else if (status === 404) {
          setAuthError('Organization not found. Please check your Organization ID.');
        } else if (status === 400) {
          if (message.includes('organization')) {
            setAuthError('Invalid organization ID. Please check your Organization ID.');
          } else if (message.includes('phone')) {
            setAuthError('Invalid phone number format. Please use a valid phone number (e.g., +1234567890)');
          } else if (message.toLowerCase().includes('password did not conform with policy') || message.toLowerCase().includes('symbol')) {
            setAuthError('Password must have symbol characters');
          } else {
            setAuthError(message || 'Invalid request data');
          }
        } else {
          setAuthError(message || 'Registration failed');
        }
      } else if (err instanceof Error) {
        // Check for specific Cognito error messages
        if (err.message.includes('phone_number')) {
          setAuthError('Invalid phone number format. Please use a valid phone number (e.g., +1234567890)');
        } else if (err.message.includes('email')) {
          setAuthError('Invalid email format or email already exists');
        } else if (err.message.toLowerCase().includes('password did not conform with policy') || err.message.toLowerCase().includes('symbol')) {
          setAuthError('Password must have symbol characters');
        } else {
          setAuthError(err.message);
        }
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
      borderRadius: { xs: 2, sm: 1 },
      '& fieldset': { borderColor: '#3a3f47' },
      '&:hover fieldset': { borderColor: 'primary.main' },
      '& input': { 
        color: '#ffffff',
        fontSize: { xs: '16px', sm: '14px' }, // Prevent zoom on iOS
        padding: { xs: '16px 14px', sm: '16px 14px' }
      },
    },
    '& .MuiInputLabel-root': { 
      color: '#ddd', 
      fontSize: { xs: '16px', sm: '14px' },
      '&.Mui-focused': { color: '#00c28c' } 
    },
    '& .MuiFormHelperText-root': {
      fontSize: { xs: '12px', sm: '12px' },
      marginLeft: 0
    }
  } as const;

  return (
    <ThemeProvider theme={SignUpTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
        }}
      >
        <Button
          component={RouterLink}
          to="/"
          startIcon={<HomeIcon />}
          variant="text"
          color="primary"
          sx={{ 
            position: 'absolute', 
            top: { xs: 16, sm: 24 }, 
            left: { xs: 16, sm: 24 }, 
            textTransform: 'none',
            zIndex: 1
          }}
        >
          Home
        </Button>

        <Container
          maxWidth="sm"
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: { xs: 2, sm: 4 },
            px: { xs: 2, sm: 3 }
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: { xs: 2, sm: 8 },
              bgcolor: 'background.paper',
              color: 'white',
              width: '100%',
              maxWidth: { xs: '100%', sm: 500 },
              '@media (max-width: 600px)': {
                bgcolor: 'transparent',
                border: 'none',
                boxShadow: 'none',
                p: 2
              },
            }}
          >
            <Typography 
              variant="h4" 
              align="center" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                color: 'primary.main',
                fontSize: { xs: '1.75rem', sm: '2.125rem' },
                mb: { xs: 1, sm: 2 }
              }}
            >
              Create Account
            </Typography>
            <Typography 
              variant="body1" 
              align="center" 
              color="grey.300" 
              sx={{ 
                mb: { xs: 2, sm: 4 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                lineHeight: 1.5
              }}
            >
              {awaitingCode
                ? `A 6-digit code was sent to ${pendingEmail}`
                : 'Fill in your details to get started'}
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={{ xs: 2, sm: 3 }}>
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
                      label="Organization ID" type="number" fullWidth
                      {...register('organizationId')}
                      error={!!errors.organizationId}
                      helperText={errors.organizationId?.message}
                      sx={{
                        ...textFieldStyles,
                        '& input[type=number]': { MozAppearance: 'textfield' },
                        '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                      }}
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 1 }}
                    />
                    <TextField
                      label="Phone Number" type="tel" fullWidth {...register('phone')}
                      placeholder="+1234567890"
                      error={!!errors.phone}
                      helperText={errors.phone?.message || "Enter phone number with country code (e.g., +1234567890)"}
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
                  sx={{ 
                    py: { xs: 1.5, sm: 1.5 },
                    fontSize: { xs: '1rem', sm: '0.875rem' },
                    fontWeight: 600,
                    borderRadius: { xs: 2, sm: 1 },
                    minHeight: { xs: 48, sm: 44 }
                  }}
                  disabled={loading}
                >
                  {loading
                    ? awaitingCode ? 'Verifying…' : 'Signing up…'
                    : awaitingCode ? 'Verify' : 'Sign Up'}
                </Button>
              </Stack>
            </form>

            {!awaitingCode && (
              <Button
                variant="text"
                color="primary"
                fullWidth
                sx={{ 
                  mt: { xs: 1.5, sm: 2 }, 
                  textTransform: 'none',
                  fontSize: { xs: '0.9rem', sm: '0.875rem' }
                }}
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
        sx={{ 
          top: { xs: 16, sm: 24 },
          left: { xs: 16, sm: 'auto' },
          right: { xs: 16, sm: 'auto' }
        }}
      >
        <Alert 
          severity="success" 
          sx={{ 
            width: '100%',
            fontSize: { xs: '0.875rem', sm: '0.875rem' }
          }}
        >
          Account verified — redirecting to login…
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default SignUpForm;
