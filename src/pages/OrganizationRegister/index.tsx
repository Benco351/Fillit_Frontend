import React, { useState } from 'react';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  ThemeProvider,
  CircularProgress,
  Stack,
} from '@mui/material';
import { LoginTheme } from '../../assets/themes/themes';
import { api } from '../../utils/apis/apiconfig';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  signUp,
  confirmSignUp,
  signOut,
  fetchAuthSession,
} from '@aws-amplify/auth';

/* ───────────────────────── Schemas ───────────────────────── */

const OrgAdminSchema = z
  .object({
    orgName: z.string().nonempty('Organization name is required'),
    adminName: z.string().nonempty('Admin name is required'),
    adminEmail: z.string().email('Please enter a valid email address'),
    adminPhone: z.string().optional(),
    adminPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a digit')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain a symbol'),
    adminConfirmPassword: z.string(),
  })
  .refine((d) => d.adminPassword === d.adminConfirmPassword, {
    message: 'Passwords do not match',
    path: ['adminConfirmPassword'],
  });

const CodeOnlySchema = z.object({
  code: z.string().length(6, 'Enter a 6-digit verification code'),
});

const FormSchema = z.union([OrgAdminSchema, CodeOnlySchema]);

type OrgForm = z.infer<typeof OrgAdminSchema>;
type CodeForm = z.infer<typeof CodeOnlySchema>;
type OrgAdminFormType = OrgForm | CodeForm;

/* ──────────────────────── Component ──────────────────────── */

const OrganizationRegister: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading]        = useState(false);
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  // Removed unused pendingEmployeeId state

  const [success, setSuccess] = useState<string | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrgAdminFormType>({
    resolver: zodResolver(FormSchema),
  });

  /* ---------- helpers ---------- */

  const clearSessionIfNeeded = async () => {
    try {
      await fetchAuthSession();
      await signOut();
    } catch {/* not signed in */}
  };

  /* ---------- submit ---------- */

  const onSubmit = async (data: OrgAdminFormType) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      /* ───── STEP 1 + 2: create org & admin ───── */
      if (!awaitingCode) {
        const {
          orgName,
          adminName,
          adminEmail,
          adminPhone,
          adminPassword,
        } = data as OrgForm;

        // First, try Cognito signUp (pre-check)
        let nextStep;
        try {
          const signUpRes = await signUp({
            username: adminEmail,
            password: adminPassword,
            options: {
              userAttributes: {
                email: adminEmail,
                ...(adminPhone ? { phone_number: adminPhone } : {}),
              },
            },
          });
          nextStep = signUpRes.nextStep;
        } catch (err: any) {
          if (err?.name === 'UsernameExistsException' || (err?.message && err.message.toLowerCase().includes('already exists'))) {
            setError('An account with this email already exists. Please use a different email or login.');
            setLoading(false);
            reset();
            return;
          }
          setError(err?.message || 'Failed to register admin in Cognito');
          setLoading(false);
          reset();
          return;
        }

        // Only if Cognito signUp succeeds, register org/admin in DB
        const res = await api.post('/api/organizations', {
          organization: { name: orgName },
          admin: { name: adminName, email: adminEmail, phone: adminPhone, password: adminPassword },
        });
        const responseData = res?.data?.data ?? {};
        const orgId = Number(responseData.organization?.organization_id);
        if (!orgId || Number.isNaN(orgId)) throw new Error('Organization creation failed');
        sessionStorage.setItem('organizationId', String(orgId));

        // Keep employeeId for custom attr (removed unused state)
        // const eid = Number(responseData.admin?.employee_id ?? responseData.admin?.id) || undefined;
        setPendingEmail(adminEmail);

        // If confirmation required, show code field
        if (nextStep && nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
          setAwaitingCode(true);
          reset({ code: '' });
          setLoading(false);
          return;
        }

        await api.post('/auth/add-to-group', { email: adminEmail, group: 'Admins' });
        setSuccess('Organization and admin created — redirecting…');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      /* ───── STEP 3: confirm sign-up ───── */
      const { code } = data as CodeForm;
      await confirmSignUp({ username: pendingEmail, confirmationCode: code.trim() });
      await clearSessionIfNeeded();
      await api.post('/auth/add-to-group', { email: pendingEmail, group: 'Admins' });

      setSuccess('Admin verified — redirecting…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed',
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------- reusable field styling ---------- */

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#3a3f47',
      borderRadius: { xs: 2, sm: 1 },
      '& fieldset': { borderColor: '#3a3f47' },
      '&:hover fieldset, &.Mui-focused fieldset': { borderColor: 'primary.main' },
    },
    '& .MuiInputBase-input': { 
      color: '#fff', 
      backgroundColor: '#3a3f47 !important',
      fontSize: { xs: '16px', sm: '14px' }, // Prevent zoom on iOS
      padding: { xs: '16px 14px', sm: '16px 14px' }
    },
    '& input:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 100px #3a3f47 inset',
      WebkitTextFillColor: '#fff',
      caretColor: '#fff',
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

  /* ---------- render ---------- */

  return (
    <ThemeProvider theme={LoginTheme}>
      <Box sx={{
        position: 'absolute', 
        inset: 0, 
        bgcolor: 'background.default',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        <Button 
          component={RouterLink} to="/"
          startIcon={<HomeIcon />}
          variant="text" color="primary"
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
            py: { xs: 4, sm: 4 },
            px: { xs: 2, sm: 3 }
          }}
        >
          <Paper elevation={3} sx={{
            p: { xs: 3, sm: 4 }, 
            borderRadius: { xs: 2, sm: 8 }, 
            bgcolor: 'background.paper', 
            color: 'white',
            width: '100%',
            maxWidth: { xs: '100%', sm: 500 },
            '@media (max-width:600px)': { 
              bgcolor: 'transparent', 
              boxShadow: 'none',
              p: 2
            }
          }}>
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
              Register Organization
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={{ xs: 2, sm: 3 }}>
                {/* org + admin fields */}
                {!awaitingCode && (
                  <>
                    <TextField 
                      label="Organization Name" 
                      fullWidth variant="outlined"
                      {...register('orgName')}
                      error={'orgName' in errors} 
                      helperText={('orgName' in errors) ? (errors as any).orgName?.message : '' }
                      required 
                      sx={textFieldStyles} 
                      autoComplete="off" 
                    />

                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mt: { xs: 2, sm: 3 }, 
                      mb: { xs: 1.5, sm: 2 } 
                    }}>
                      <AdminPanelSettingsIcon sx={{ 
                        color: '#d8d8c5', 
                        fontSize: { xs: 28, sm: 32 }, 
                        mr: 1 
                      }} />
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          color: '#d8d8c5', 
                          fontWeight: 600,
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }}
                      >
                        Admin Account Details
                      </Typography>
                    </Box>

                    <TextField 
                      label="Full Name" 
                      fullWidth variant="outlined"
                      {...register('adminName')}
                      error={'adminName' in errors} 
                      helperText={('adminName' in errors) ? (errors as any).adminName?.message : '' }
                      required 
                      sx={textFieldStyles} 
                      autoComplete="off" 
                    />

                    <TextField 
                      label="Email" 
                      type="email" 
                      fullWidth variant="outlined"
                      {...register('adminEmail')}
                      error={'adminEmail' in errors} 
                      helperText={('adminEmail' in errors) ? (errors as any).adminEmail?.message : '' }
                      required 
                      sx={textFieldStyles} 
                      autoComplete="email" 
                    />

                    <TextField 
                      label="Phone Number" 
                      type="tel" 
                      fullWidth variant="outlined"
                      {...register('adminPhone')}
                      error={'adminPhone' in errors} 
                      helperText={('adminPhone' in errors) ? (errors as any).adminPhone?.message : '' }
                      sx={textFieldStyles} 
                      autoComplete="tel" 
                    />

                    <TextField 
                      label="Password" 
                      type="password" 
                      fullWidth variant="outlined"
                      {...register('adminPassword')}
                      error={'adminPassword' in errors} 
                      helperText={('adminPassword' in errors) ? (errors as any).adminPassword?.message : '' }
                      required 
                      sx={textFieldStyles} 
                      autoComplete="new-password" 
                    />

                    <TextField 
                      label="Confirm Password" 
                      type="password" 
                      fullWidth variant="outlined"
                      {...register('adminConfirmPassword')}
                      error={'adminConfirmPassword' in errors} 
                      helperText={('adminConfirmPassword' in errors) ? (errors as any).adminConfirmPassword?.message : '' }
                      required 
                      sx={textFieldStyles} 
                      autoComplete="new-password" 
                    />
                  </>
                )}

                {/* code field */}
                {awaitingCode && (
                  <TextField 
                    label="6-digit Code" 
                    fullWidth variant="outlined"
                    {...register('code')}
                    error={'code' in errors} 
                    helperText={('code' in errors) ? (errors as any).code?.message : '' }
                    sx={textFieldStyles} 
                    inputProps={{ maxLength: 6 }} 
                    autoComplete="one-time-code" 
                  />
                )}

                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  disabled={loading} 
                  sx={{ 
                    py: { xs: 1.5, sm: 1.5 },
                    fontSize: { xs: '1rem', sm: '0.875rem' },
                    fontWeight: 600,
                    borderRadius: { xs: 2, sm: 1 },
                    minHeight: { xs: 48, sm: 44 }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : awaitingCode ? (
                    'Verify'
                  ) : (
                    'Register Organization & Admin'
                  )}
                </Button>
              </Stack>
            </form>
          </Paper>
        </Container>
      </Box>

      <Snackbar 
        open={!!success} 
        autoHideDuration={4000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccess(null)} 
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setError(null)} 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default OrganizationRegister;
