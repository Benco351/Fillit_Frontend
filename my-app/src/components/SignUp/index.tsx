/**
 * src/pages/SignUpPage.tsx
 * --------------------------------------------------------------
 * Sign‑up screen that
 *   • validates with zod / react‑hook‑form
 *   • posts to POST /api/employees
 *   • shows a success Snackbar
 *   • redirects to “/login” two seconds after success
 * --------------------------------------------------------------
 */

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
import axios from 'axios';

import { SignUpTheme } from '../../assets/themes/themes';

/* -------------------------------------------------- */
/* Axios instance                                     */
/* -------------------------------------------------- */
const employee_api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

/* -------------------------------------------------- */
/* Validation schema                                  */
/* -------------------------------------------------- */
const SignUpSchema = z
  .object({
    name: z.string().nonempty('Name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignUpForm = z.infer<typeof SignUpSchema>;

/* -------------------------------------------------- */
/* Component                                          */
/* -------------------------------------------------- */
const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [snackOpen, setSnackOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpForm>({ resolver: zodResolver(SignUpSchema) });

  const onSubmit = async (data: SignUpForm) => {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone ?? undefined,
    };

    try {
      const res = await employee_api.post('/api/employees', payload);

      setEmployeeId(res.data.data.employee_id);
      console.info('Employee created, id =', res.data.data.employee_id);

      setSnackOpen(true);               // show the popup
      setTimeout(() => navigate('/login'), 2000); // redirect after 2 s
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? String(err.response.data.error)
          : 'Registration failed. Please try again.';
      setError('email', { type: 'manual', message });
    }
  };

  /* —— reusable TextField styles ———————————————— */
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
          position: 'absolute',
          inset: 0,
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* floating Home button */}
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

        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{ p: 4, borderRadius: 8, bgcolor: 'background.paper', color: 'white' }}
          >
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{ fontWeight: 700, color: 'primary.main' }}
            >
              Create Account
            </Typography>
            <Typography variant="body1" align="center" color="grey.300" sx={{ mb: 4 }}>
              Fill in your details to get started
            </Typography>

            {/* form ------------------------------------------------ */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={3}>
                <TextField
                  label="Full Name"
                  fullWidth
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={textFieldStyles}
                />

                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={textFieldStyles}
                />

                <TextField
                  label="Phone Number"
                  type="tel"
                  fullWidth
                  {...register('phone')}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  sx={textFieldStyles}
                />

                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={textFieldStyles}
                />

                <TextField
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  sx={textFieldStyles}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Sign Up
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
              Already have an account? Click here to Login
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* success popup ------------------------------------------ */}
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

export default SignUpPage;
