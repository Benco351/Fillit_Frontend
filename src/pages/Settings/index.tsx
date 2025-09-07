import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  InputAdornment,
  CssBaseline,
  ThemeProvider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Delete,
  Save,
  Person,
  Phone,
  Lock,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainTheme, swapPageTheme } from '../../assets/themes/themes';
import Navbar from '../../components/layout/userNavbar';
import { ROUTES } from '../../routes/config/routes';
import { updateEmployeeById, deleteEmployeeById, getEmployeeById } from '../../utils/apis/employeeShiftApis';
import { getEmployees } from '../../utils/apis/employeeShiftApis';

// Validation schemas
const ProfileUpdateSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  password: z.union([
    z.string().min(8, 'Password must be at least 8 characters'),
    z.literal(''),
    z.undefined()
  ]).optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // Only validate password matching if password is provided and not empty
  if (data.password && data.password.trim() !== '') {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileUpdateFormData = z.infer<typeof ProfileUpdateSchema>;

const glassButtonStyle = {
  background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.1), rgba(0, 194, 140, 0.2))',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(0, 194, 140, 0.3)',
  color: '#00c28c',
  textTransform: 'none',
  padding: '8px 20px',
  borderRadius: '12px',
  fontSize: '0.95rem',
  fontWeight: 500,
  letterSpacing: '0.5px',
  boxShadow: '0 4px 15px rgba(0, 194, 140, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.2), rgba(0, 194, 140, 0.3))',
    border: '1px solid rgba(0, 194, 140, 0.5)',
    boxShadow: '0 8px 20px rgba(0, 194, 140, 0.2)',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(1px)',
    boxShadow: '0 2px 10px rgba(0, 194, 140, 0.15)',
  }
};

const dangerButtonStyle = {
  background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.2))',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(244, 67, 54, 0.3)',
  color: '#f44336',
  textTransform: 'none',
  padding: '8px 20px',
  borderRadius: '12px',
  fontSize: '0.95rem',
  fontWeight: 500,
  letterSpacing: '0.5px',
  boxShadow: '0 4px 15px rgba(244, 67, 54, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.2), rgba(244, 67, 54, 0.3))',
    border: '1px solid rgba(244, 67, 54, 0.5)',
    boxShadow: '0 8px 20px rgba(244, 67, 54, 0.2)',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(1px)',
    boxShadow: '0 2px 10px rgba(244, 67, 54, 0.15)',
  }
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOnlyUser, setIsOnlyUser] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(ProfileUpdateSchema),
  });

  // Get current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const employeeId = sessionStorage.getItem('customEmployeeId');
        if (employeeId) {
          const response = await getEmployeeById(Number(employeeId));
          if (response?.data) {
            setCurrentUser(response.data);
            setValue('name', response.data.employee_name || '');
            setValue('phone', response.data.employee_phone || '');
          }
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        showSnackbar('Failed to load user information', 'error');
      }
    };

    const checkIfOnlyUser = async () => {
      try {
        const organizationId = sessionStorage.getItem('organizationId');
        if (organizationId) {
          const response = await getEmployees({ organization_id: Number(organizationId) });
          if (response?.data && response.data.length === 1) {
            setIsOnlyUser(true);
          }
        }
      } catch (error) {
        console.error('Error checking user count:', error);
      }
    };

    fetchCurrentUser();
    checkIfOnlyUser();
  }, [setValue]);

  // Prevent scroll jumping on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Determine background color based on user type
  const getBackgroundColor = () => {
    const isAdmin = typeof window !== 'undefined' && sessionStorage.getItem('isAdmin') === 'true';
    return isAdmin ? swapPageTheme.adminBg : '#093039';
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleGoToDashboard = () => {
    const isAdmin = typeof window !== 'undefined' && sessionStorage.getItem('isAdmin') === 'true';
    const targetRoute = isAdmin ? ROUTES.ADMIN : ROUTES.DASHBOARD;
    navigate(targetRoute);
  };

  const onSubmit = async (data: ProfileUpdateFormData) => {
    setLoading(true);
    try {
      const employeeId = sessionStorage.getItem('customEmployeeId');
      if (!employeeId) {
        throw new Error('User ID not found');
      }

      // Prepare update data - only include fields that have values
      const updateData: any = {};
      if (data.name && data.name.trim()) {
        updateData.name = data.name.trim();
      }
      if (data.phone && data.phone.trim()) {
        updateData.phone = data.phone.trim();
      }
      if (data.password && data.password.trim()) {
        updateData.password = data.password.trim();
      }

      // Only make API call if there's something to update
      if (Object.keys(updateData).length > 0) {
        await updateEmployeeById(Number(employeeId), updateData);
        
        // Update session storage if name was changed
        if (updateData.name) {
          sessionStorage.setItem('name', updateData.name);
        }
        
        showSnackbar('Profile updated successfully!', 'success');
        
        // Reset form to clear password fields
        reset({
          name: updateData.name || currentUser?.employee_name || '',
          phone: updateData.phone || currentUser?.employee_phone || '',
          password: '',
          confirmPassword: '',
        });
      } else {
        showSnackbar('No changes to save', 'error');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showSnackbar(error?.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

const handleDeleteAccount = async () => {
  setDeleteLoading(true);
  try {
    const employeeId = sessionStorage.getItem('customEmployeeId');
    if (!employeeId) throw new Error('User ID not found');

    const response = await deleteEmployeeById(Number(employeeId));
    console.log('Delete account response:', response);
    if (response?.status === 'ok') {
    // Success
    sessionStorage.clear();
    setDeleteDialogOpen(false);
    showSnackbar('Account deleted successfully!', 'success');
    setTimeout(() => navigate(ROUTES.HOME, { replace: true }), 2000);
    } else {
    throw new Error('Account deletion failed');
    }
  } catch (error: any) {
    console.error('Error deleting account:', error);
    showSnackbar('Failed to delete account', 'error');
  } finally {
    setDeleteLoading(false);
    setDeleteDialogOpen(false);
  }
};


  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <ThemeProvider theme={MainTheme}>
      <CssBaseline />
      <Box sx={{ 
        backgroundColor: getBackgroundColor(), 
        minHeight: '100vh', 
        py: 4, 
        px: 2,
        scrollBehavior: 'smooth',
        overflowAnchor: 'none'
      }}>
        <Container maxWidth={false} sx={{ 
          px: { xs: 0.5, sm: 2, md: 3 }, 
          width: '100%', 
          maxWidth: '100%',
          scrollBehavior: 'smooth'
        }}>
          <Navbar />

          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              sx={{ 
                color: '#fff', 
                fontWeight: 700, 
                mb: 1,
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' },
                wordBreak: 'break-word',
                hyphens: 'auto',
                lineHeight: 1.2,
                px: { xs: 1, sm: 0 }
              }}
            >
              Settings
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                mb: 3,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                px: { xs: 1, sm: 0 },
                lineHeight: 1.4
              }}
            >
              Manage your profile information and account settings
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, maxWidth: 'lg', mx: 'auto' }}>
            {/* Profile Update Section */}
            <Box sx={{ flex: { xs: 1, md: 2 } }}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Person sx={{ mr: 2, color: '#00c28c', fontSize: { xs: 24, sm: 28 } }} />
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#00c28c',
                      fontSize: { xs: '1.2rem', sm: '1.5rem' }
                    }}
                  >
                    Profile Information
                  </Typography>
                </Box>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      {...register('name')}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: '#00c28c' }} />
                          </InputAdornment>
                        ),
                        sx: {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '12px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid rgba(0, 194, 140, 0.5)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid #00c28c',
                          },
                          '& input': {
                            color: '#fff',
                          }
                        }
                      }}
                      InputLabelProps={{
                        sx: {
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&.Mui-focused': {
                            color: '#00c28c',
                          },
                        },
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Phone Number"
                      {...register('phone')}
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone sx={{ color: '#00c28c' }} />
                          </InputAdornment>
                        ),
                        sx: {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '12px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid rgba(0, 194, 140, 0.5)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid #00c28c',
                          },
                          '& input': {
                            color: '#fff',
                          }
                        }
                      }}
                      InputLabelProps={{
                        sx: {
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&.Mui-focused': {
                            color: '#00c28c',
                          },
                        },
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="New Password (optional)"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: '#00c28c' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '12px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid rgba(0, 194, 140, 0.5)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid #00c28c',
                          },
                          '& input': {
                            color: '#fff',
                          }
                        }
                      }}
                      InputLabelProps={{
                        sx: {
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&.Mui-focused': {
                            color: '#00c28c',
                          },
                        },
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: '#00c28c' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '12px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid rgba(0, 194, 140, 0.5)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid #00c28c',
                          },
                          '& input': {
                            color: '#fff',
                          }
                        }
                      }}
                      InputLabelProps={{
                        sx: {
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&.Mui-focused': {
                            color: '#00c28c',
                          },
                        },
                      }}
                    />
                    
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                      sx={glassButtonStyle}
                      fullWidth
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </Box>
                </form>
              </Paper>
            </Box>

            {/* Account Actions Section */}
            { <Box sx={{ flex: { xs: 1, md: 1 } }}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  height: 'fit-content',
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 3, 
                    color: '#f44336',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  Danger Zone
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    mb: 3,
                    fontSize: { xs: '0.85rem', sm: '0.875rem' },
                    lineHeight: 1.5
                  }}
                >
                  {isOnlyUser 
                    ? 'You are the only user in your organization. Deleting your account will also delete the entire organization.'
                    : 'Permanently delete your account. This action cannot be undone.'
                  }
                </Typography>
                
                <Button
                  variant="contained"
                  startIcon={<Delete />}
                  onClick={handleOpenDeleteDialog}
                  sx={dangerButtonStyle}
                  fullWidth
                >
                  Delete Account
                </Button>
              </Paper>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>

              </Box>
            </Box> }
          </Box>
        </Container>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: '#f44336', fontWeight: 600 }}>
            Confirm Account Deletion
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete your account? This action cannot be undone.
            </Typography>
            {isOnlyUser && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Warning:</strong> You are the only user in your organization. 
                  Deleting your account will also permanently delete the entire organization 
                  and all associated data.
                </Typography>
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary">
              Please type <strong>DELETE</strong> to confirm:
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              color="error"
              variant="contained"
              disabled={deleteLoading}
              startIcon={deleteLoading ? <CircularProgress size={20} /> : <Delete />}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

      </Box>
    </ThemeProvider>
  );
};

export default SettingsPage;