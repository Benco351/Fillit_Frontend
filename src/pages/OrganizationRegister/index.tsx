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
import { signUp, confirmSignUp, signOut, fetchAuthSession } from '@aws-amplify/auth';

// Validation schema for organization + admin user
const OrgAdminSchema = z.object({
  orgName: z.string().nonempty('Organization name is required'),
  adminName: z.string().nonempty('Admin name is required'),
  adminEmail: z.string().email('Please enter a valid email address'),
  adminPhone: z.string().optional(),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
  adminConfirmPassword: z.string(),
  code: z.string().optional(), // 6-digit confirmation code when required
}).refine((d) => d.adminPassword === d.adminConfirmPassword, {
  message: 'Passwords do not match',
  path: ['adminConfirmPassword'],
});

type OrgAdminFormType = z.infer<typeof OrgAdminSchema>;

const OrganizationRegister: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailPopup, setEmailPopup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingEmployeeId, setPendingEmployeeId] = useState<number | undefined>(undefined);


  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<OrgAdminFormType>({ resolver: zodResolver(OrgAdminSchema) });

  async function clearSessionIfNeeded() {
    try {
      await fetchAuthSession();
      await signOut();
    } catch {
      // not signed in; nothing to do
    }
  }

  const onSubmit = async (data: OrgAdminFormType) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!awaitingCode) {
        // STEP 1: Create organization and admin in backend
        const payload = {
          organization: { name: data.orgName },
          admin: {
            name: data.adminName,
            email: data.adminEmail,
            phone: data.adminPhone,
            password: data.adminPassword,
          },
        };
        const res = await api.post('/api/organizations', payload);
        const responseData = res?.data?.data || {};
        const orgId = Number(responseData.organization?.organization_id);
        if (!orgId || isNaN(orgId)) throw new Error('Organization creation failed');
        sessionStorage.setItem('organizationId', orgId.toString());

        // Extract created admin employee_id and admin flag if present
        const adminEmployeeId: number | undefined = Number(
          responseData.admin?.employee_id ?? responseData.admin?.id
        ) || undefined;
        const isAdminResp: boolean = !!(responseData.admin?.employee_admin ?? responseData.admin?.admin ?? true);
        setPendingEmployeeId(adminEmployeeId);
        setPendingEmail(data.adminEmail);

        // STEP 2: Sign up admin in Cognito with custom:employeeId
        const { nextStep } = await signUp({
          username: data.adminEmail,
          password: data.adminPassword,
          options: {
            userAttributes: {
              email: data.adminEmail,
              ...(adminEmployeeId != null ? { 'custom:employeeId': String(adminEmployeeId) } : {}),
              ...(data.adminPhone ? { phone_number: data.adminPhone } : {}),
            },
          },
        });

        if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
          setAwaitingCode(true);
          // Clear sensitive fields; keep email to inform the user where the code was sent
          reset({
            orgName: '',
            adminName: '',
            adminEmail: data.adminEmail,
            adminPhone: '',
            adminPassword: '',
            adminConfirmPassword: '',
            code: '',
          });
          // UI will switch to code field; do not navigate yet
          return;
        }

        // No confirmation required — add to Admins group and finish
        await api.post('/auth/add-to-group', {
          email: data.adminEmail,
          group: 'Admins',
        });
        setSuccess('Organization and admin created. Redirecting to login…');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // STEP 3: Confirm sign-up with code
      const code = getValues('code')?.trim();
      if (!code) {
        throw new Error('Please enter the verification code.');
      }
      await confirmSignUp({ username: pendingEmail, confirmationCode: code });
      await clearSessionIfNeeded();

      // Add confirmed admin to Admins group
      await api.post('/auth/add-to-group', { email: pendingEmail, group: 'Admins' });
      setSuccess('Admin verified — redirecting to login…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to register organization and admin'
      );
    } finally {
      setLoading(false);
    }
  };

  // Dark theme field styles
  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#3a3f47', // dark background
      '& fieldset': { borderColor: 'grey.300' },
      '&:hover fieldset': { borderColor: 'primary.main' },
      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
    },
    '& .MuiInputBase-input': {
      color: '#ffffff', // text white
      backgroundColor: '#3a3f47 !important', // force dark even when typing/autofill
    },
    '& input:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 100px #3a3f47 inset',
      WebkitTextFillColor: '#ffffff',
      caretColor: '#ffffff',
    },
    '& .MuiInputLabel-root': {
      color: '#ddd',
      '&.Mui-focused': { color: '#00c28c' },
    },
  } as const;

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
            p: 4, borderRadius: 8, bgcolor: 'background.paper',
            '@media (max-width:600px)': { bgcolor: 'transparent', boxShadow: 'none' },
          }}>
            <Typography variant="h4" align="center" gutterBottom
              sx={{ fontWeight: 700, color: 'primary.main' }}
            >
              Register Organization
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 3, color: '#fff' }}>
              {awaitingCode
                ? `A 6-digit code was sent to ${pendingEmail}`
                : 'Create your organization and the first admin account to start using Fillit.'}
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
              {/* Organization fields */}
              {!awaitingCode && (
              <TextField
                label="Organization Name"
                fullWidth
                {...register('orgName')}
                error={!!errors.orgName}
                helperText={errors.orgName?.message}
                required
                sx={{ mb: 3, ...textFieldStyles }}
                autoComplete="off"
              />)}

              {/* Admin user fields */}
              {!awaitingCode ? (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                  <AdminPanelSettingsIcon sx={{ color: '#d8d8c5', fontSize: 32, mr: 1 }} />
                  <Typography variant="subtitle1" sx={{ color: '#d8d8c5', fontWeight: 600 }}>
                    Admin Account Details
                  </Typography>
                </Box>
              ) : null}
              {!awaitingCode ? (
              <TextField
                label="Full Name"
                fullWidth
                {...register('adminName')}
                error={!!errors.adminName}
                helperText={errors.adminName?.message}
                required
                sx={{ mb: 2, ...textFieldStyles }}
                autoComplete="off"
              />) : null}
              {!awaitingCode ? (
              <TextField
                label="Email"
                type="email"
                fullWidth
                {...register('adminEmail')}
                error={!!errors.adminEmail}
                helperText={errors.adminEmail?.message}
                required
                sx={{ mb: 2, ...textFieldStyles }}
                autoComplete="email"
              />) : null}
              {!awaitingCode ? (
              <TextField
                label="Phone Number"
                type="tel"
                fullWidth
                {...register('adminPhone')}
                error={!!errors.adminPhone}
                helperText={errors.adminPhone?.message}
                sx={{ mb: 2, ...textFieldStyles }}
                autoComplete="tel"
              />) : null}
              {!awaitingCode ? (
              <TextField
                label="Password"
                type="password"
                fullWidth
                {...register('adminPassword')}
                error={!!errors.adminPassword}
                helperText={errors.adminPassword?.message}
                required
                sx={{ mb: 2, ...textFieldStyles }}
                autoComplete="new-password"
              />) : null}
              {!awaitingCode ? (
              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                {...register('adminConfirmPassword')}
                error={!!errors.adminConfirmPassword}
                helperText={errors.adminConfirmPassword?.message}
                required
                sx={{ mb: 3, ...textFieldStyles }}
                 autoComplete="new-password"
              />) : (
                <TextField
                  label="6-digit Code"
                  fullWidth
                  {...register('code')}
                  error={!!errors.code}
                  helperText={(errors as any)?.code?.message}
                  sx={{ mb: 3, ...textFieldStyles }}
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
                sx={{ py: 1.5 }}
              >
                {loading
                  ? awaitingCode ? 'Verifying…' : <CircularProgress size={22} color="inherit" />
                  : awaitingCode ? 'Verify' : 'Register Organization & Admin'}
              </Button>
            </form>

          </Paper>
        </Container>
      </Box>
      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setError(null)} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default OrganizationRegister;