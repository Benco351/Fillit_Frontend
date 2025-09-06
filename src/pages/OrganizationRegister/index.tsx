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
  const [pendingEmployeeId, setPendingEmployeeId] = useState<number>();

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

        // Cognito pre-check: see if user already exists
        try {
          // This will throw if user exists
          await signUp({
            username: adminEmail,
            password: adminPassword,
            options: {
              userAttributes: {
                email: adminEmail,
                ...(adminPhone ? { phone_number: adminPhone } : {}),
              },
            },
          });
        } catch (err: any) {
          // Cognito error: user already exists
          if (err?.name === 'UsernameExistsException' || (err?.message && err.message.toLowerCase().includes('already exists'))) {
            setError('An account with this email already exists. Please use a different email or login.');
            setLoading(false);
            reset(); // clear form so user can try again
            return;
          }
          // Other Cognito errors: show message
          setError(err?.message || 'Failed to check user existence');
          setLoading(false);
          reset();
          return;
        }

        // If user does not exist, proceed with org/admin registration in DB
        const res = await api.post('/api/organizations', {
          organization: { name: orgName },
          admin: { name: adminName, email: adminEmail, phone: adminPhone, password: adminPassword },
        });
        const responseData = res?.data?.data ?? {};
        const orgId = Number(responseData.organization?.organization_id);
        if (!orgId || Number.isNaN(orgId)) throw new Error('Organization creation failed');
        sessionStorage.setItem('organizationId', String(orgId));

        // Keep employeeId for custom attr
        const eid = Number(responseData.admin?.employee_id ?? responseData.admin?.id) || undefined;
        setPendingEmployeeId(eid);
        setPendingEmail(adminEmail);

        // Now sign up for real, with custom:employeeId
        const { nextStep } = await signUp({
          username: adminEmail,
          password: adminPassword,
          options: {
            userAttributes: {
              email: adminEmail,
              ...(eid ? { 'custom:employeeId': String(eid) } : {}),
              ...(adminPhone ? { phone_number: adminPhone } : {}),
            },
          },
        });

        if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
          setAwaitingCode(true);
          reset({ code: '' });
          setLoading(false);
          return; // stop here until code arrives
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
      '& fieldset': { borderColor: 'grey.300' },
      '&:hover fieldset, &.Mui-focused fieldset': { borderColor: 'primary.main' },
    },
    '& .MuiInputBase-input': { color: '#fff', backgroundColor: '#3a3f47 !important' },
    '& input:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 100px #3a3f47 inset',
      WebkitTextFillColor: '#fff',
      caretColor: '#fff',
    },
    '& .MuiInputLabel-root': { color: '#ddd', '&.Mui-focused': { color: '#00c28c' } },
  } as const;

  /* ---------- render ---------- */

  return (
    <ThemeProvider theme={LoginTheme}>
      <Box sx={{ position:'absolute', inset:0, bgcolor:'background.default', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Button component={RouterLink} to="/" startIcon={<HomeIcon />} variant="text" color="primary"
          sx={{ position:'absolute', top:24, left:24, textTransform:'none' }}>
          Home
        </Button>

        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ p:4, borderRadius:8, bgcolor:'background.paper',
            '@media (max-width:600px)': { bgcolor:'transparent', boxShadow:'none' } }}>

            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight:700, color:'primary.main' }}>
              Register Organization
            </Typography>

            <Typography variant="body1" align="center" sx={{ mb:3, color:'#fff' }}>
              {awaitingCode
                ? `A 6-digit code was sent to ${pendingEmail}`
                : 'Create your organization and first admin to start using Fillit.'}
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* org + admin fields */}
              {!awaitingCode && (
                <>
                  <TextField label="Organization Name" fullWidth {...register('orgName')}
                    error={'orgName' in errors} helperText={('orgName' in errors) ? (errors as any).orgName?.message : '' }
                    required sx={{ mb:3, ...textFieldStyles }} autoComplete="off" />

                  <Box sx={{ display:'flex', alignItems:'center', mt:2, mb:1 }}>
                    <AdminPanelSettingsIcon sx={{ color:'#d8d8c5', fontSize:32, mr:1 }} />
                    <Typography variant="subtitle1" sx={{ color:'#d8d8c5', fontWeight:600 }}>
                      Admin Account Details
                    </Typography>
                  </Box>

                  <TextField label="Full Name" fullWidth {...register('adminName')}
                    error={'adminName' in errors} helperText={('adminName' in errors) ? (errors as any).adminName?.message : '' }
                    required sx={{ mb:2, ...textFieldStyles }} autoComplete="off" />

                  <TextField label="Email" type="email" fullWidth {...register('adminEmail')}
                    error={'adminEmail' in errors} helperText={('adminEmail' in errors) ? (errors as any).adminEmail?.message : '' }
                    required sx={{ mb:2, ...textFieldStyles }} autoComplete="email" />

                  <TextField label="Phone Number" type="tel" fullWidth {...register('adminPhone')}
                    error={'adminPhone' in errors} helperText={('adminPhone' in errors) ? (errors as any).adminPhone?.message : '' }
                    sx={{ mb:2, ...textFieldStyles }} autoComplete="tel" />

                  <TextField label="Password" type="password" fullWidth {...register('adminPassword')}
                    error={'adminPassword' in errors} helperText={('adminPassword' in errors) ? (errors as any).adminPassword?.message : '' }
                    required sx={{ mb:2, ...textFieldStyles }} autoComplete="new-password" />

                  <TextField label="Confirm Password" type="password" fullWidth {...register('adminConfirmPassword')}
                    error={'adminConfirmPassword' in errors} helperText={('adminConfirmPassword' in errors) ? (errors as any).adminConfirmPassword?.message : '' }
                    required sx={{ mb:3, ...textFieldStyles }} autoComplete="new-password" />
                </>
              )}

              {/* code field */}
              {awaitingCode && (
                <TextField label="6-digit Code" fullWidth {...register('code')}
                  error={'code' in errors} helperText={('code' in errors) ? (errors as any).code?.message : '' }
                  sx={{ mb:3, ...textFieldStyles }} inputProps={{ maxLength:6 }} autoComplete="one-time-code" />
              )}

              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ py:1.5 }}>
                {loading ? <CircularProgress size={22} color="inherit" /> : awaitingCode ? 'Verify' : 'Register Organization & Admin'}
              </Button>
            </form>
          </Paper>
        </Container>
      </Box>

      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ width:'100%' }}>{success}</Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert severity="error" onClose={() => setError(null)} sx={{ width:'100%' }}>{error}</Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default OrganizationRegister;
