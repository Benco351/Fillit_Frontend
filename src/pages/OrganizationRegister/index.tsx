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
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Validation schema for organization + admin user
const OrgAdminSchema = z.object({
  orgName: z.string().nonempty('Organization name is required'),
  adminName: z.string().nonempty('Admin name is required'),
  adminEmail: z.string().email('Please enter a valid email address'),
  adminPhone: z.string().optional(),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
  adminConfirmPassword: z.string(),
}).refine((d) => d.adminPassword === d.adminConfirmPassword, {
  message: 'Passwords do not match',
  path: ['adminConfirmPassword'],
});

type OrgAdminFormType = z.infer<typeof OrgAdminSchema>;

const OrganizationRegister: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null);


  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrgAdminFormType>({ resolver: zodResolver(OrgAdminSchema) });

  const onSubmit = async (data: OrgAdminFormType) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setCreatedOrgId(null);
    try {
      // Send all organization and admin info in one request
      const payload = {
        organization: {
          name: data.orgName,
        },
        admin: {
          name: data.adminName,
          email: data.adminEmail,
          phone: data.adminPhone,
          password: data.adminPassword,
        },
      };
      const res = await api.post('/api/organization', payload);
      const responseData = res?.data?.data || {};
      const orgId = responseData.organization_id || responseData.orgId || responseData.id;
      if (!orgId) throw new Error('Organization creation failed');
      setCreatedOrgId(orgId);
      setSuccess('Organization and admin account created successfully');
      reset();
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
              Create your organization and the first admin account to start using Fillit.
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Organization fields */}
              <TextField
                label="Organization Name"
                fullWidth
                {...register('orgName')}
                error={!!errors.orgName}
                helperText={errors.orgName?.message}
                required
                sx={{ mb: 3, ...textFieldStyles }}
              />

              {/* Admin user fields */}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                  <AdminPanelSettingsIcon sx={{ color: '#d8d8c5', fontSize: 32, mr: 1 }} />
                  <Typography variant="subtitle1" sx={{ color: '#d8d8c5', fontWeight: 600 }}>
                    Admin Account Details
                  </Typography>
                </Box>
              <TextField
                label="Full Name"
                fullWidth
                {...register('adminName')}
                error={!!errors.adminName}
                helperText={errors.adminName?.message}
                required
                sx={{ mb: 2, ...textFieldStyles }}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                {...register('adminEmail')}
                error={!!errors.adminEmail}
                helperText={errors.adminEmail?.message}
                required
                sx={{ mb: 2, ...textFieldStyles }}
              />
              <TextField
                label="Phone Number"
                type="tel"
                fullWidth
                {...register('adminPhone')}
                error={!!errors.adminPhone}
                helperText={errors.adminPhone?.message}
                sx={{ mb: 2, ...textFieldStyles }}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                {...register('adminPassword')}
                error={!!errors.adminPassword}
                helperText={errors.adminPassword?.message}
                required
                sx={{ mb: 2, ...textFieldStyles }}
              />
              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                {...register('adminConfirmPassword')}
                error={!!errors.adminConfirmPassword}
                helperText={errors.adminConfirmPassword?.message}
                required
                sx={{ mb: 3, ...textFieldStyles }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {loading
                  ? <CircularProgress size={22} color="inherit" />
                  : 'Register Organization & Admin'}
              </Button>
            </form>

            {createdOrgId != null && (
              <Box sx={{ mt: 3, p: 2, borderRadius: 2, background: 'rgba(0,194,140,0.08)', border: '1px solid rgba(0,194,140,0.2)' }}>
                <Typography variant="subtitle1" fontWeight={700} color="primary">
                  Organization ID: {createdOrgId}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Share this ID with your team so they can join during signup.
                </Typography>
              </Box>
            )}
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