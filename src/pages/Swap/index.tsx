import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  ThemeProvider,
  CssBaseline,
  IconButton,
  Stack,
  useTheme,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { getEmployees } from '../../utils/apis/employeeShiftApis';
import { Employee } from '../../components/CalendarFeatures/calendarStates';
import { MainTheme, swapPageColors } from '../../assets/themes/themes';
import { useUserDashboard } from '../../hooks/useUserDashboard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/config/routes';
import Footer from '../../components/layout/Footer';

const getCurrentUser = () => {
  // Read from sessionStorage (set during login)
  const name = sessionStorage.getItem('name');
  const email = sessionStorage.getItem('email');
  const admin = sessionStorage.getItem('isAdmin');
  const id = sessionStorage.getItem('customEmployeeId');
  return {
    name: name || 'Unknown',
    email: email || 'Unknown',
    admin: admin === 'true',
    id: id || 'Unknown',
  };
};

const EmployeeCard: React.FC<{ emp: Employee }> = ({ emp }) => {
  const theme = useTheme();
  const { commonButtonStyle } = useUserDashboard({ id: 0, name: '', email: '' });
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        minWidth: 260,
        maxWidth: 320,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        border: swapPageColors.cardBorder,
        boxShadow: swapPageColors.cardShadow,
        background: swapPageColors.cardBg,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.03)',
          background: swapPageColors.cardHover,
          boxShadow: '0px 8px 30px rgba(0,0,0,0.13)',
        },
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: swapPageColors.avatarBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          color: swapPageColors.avatarText,
          mb: 1,
          fontWeight: 600,
          textTransform: 'uppercase',
        }}
      >
        {emp.name?.[0] || '?'}
      </Box>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom align="center" color="white">
        {emp.name}
      </Typography>
      <Typography variant="body2" color="grey.300" align="center">
        ID: {emp.id}
      </Typography>
      <Typography variant="body2" color="grey.300" align="center">
        Email: {emp.email || 'N/A'}
      </Typography>
      <Typography variant="body2" color="primary" fontWeight={500} align="center">
        Role: {emp.admin ? 'Admin' : 'User'}
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
        <IconButton
          color="primary"
          sx={{
            bgcolor: 'primary.light',
            color: 'white',
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,194,140,0.10)',
            '&:hover': { bgcolor: 'primary.main' },
            p: 0,
          }}
          aria-label="Chat"
        >
          <ChatIcon fontSize="medium" />
        </IconButton>
        <Button
          variant="contained"
          startIcon={<SwapHorizIcon />}
          sx={{
            ...commonButtonStyle,
            borderRadius: 3,
            bgcolor: 'primary.main',
            color: 'white',
            minWidth: 120,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.10)',
            '&:hover': {
              bgcolor: 'primary.dark',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.13)',
            },
            '&:active': {
              boxShadow: '0 2px 6px rgba(0,0,0,0.10)',
            },
          }}
        >
          Request Swap
        </Button>
      </Stack>
    </Paper>
  );
};

const SwapPage: React.FC = () => {
  const user = getCurrentUser();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { commonButtonStyle } = useUserDashboard({ id: 0, name: '', email: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getEmployees();
        // Map backend fields to Employee type
        const mappedEmployees = (res.data || []).map((emp: any) => ({
          id: emp.employee_id,
          name: emp.employee_name,
          email: emp.employee_email,
          admin: emp.employee_admin,
        }));
        setEmployees(mappedEmployees);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch employees');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <ThemeProvider theme={MainTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: swapPageColors.background, py: { xs: 4, md: 8 } }}>
        <Box sx={{ maxWidth: 900, mx: 'auto', px: 2 }}>
          {/* Return Button */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(ROUTES.DASHBOARD)}
            sx={{ ...commonButtonStyle, mb: 3, bgcolor: 'primary.main', color: 'white', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            Back to Dashboard
          </Button>
          {/* Main Content */}
          <Typography variant="h3" fontWeight={700} color="primary" align="center" gutterBottom>
            Swap Shifts
          </Typography>
          <Typography variant="body1" align="center" color="grey.300" sx={{ mb: 3 }}>
            Connect with other employees to chat and request shift swaps.
          </Typography>
          <Paper sx={{ mt: 4, p: { xs: 2, sm: 3 }, display: 'inline-block', minWidth: 300, borderRadius: 3, mx: 'auto', background: swapPageColors.infoPaperBg, border: swapPageColors.cardBorder, boxShadow: swapPageColors.cardShadow }} elevation={0}>
            <Typography variant="h6" gutterBottom align="center" color="white">Current User Info</Typography>
            <Typography color="white">Name: {user.name}</Typography>
            <Typography color="grey.300">Email: {user.email}</Typography>
            <Typography color="grey.300">User ID: {user.id}</Typography>
            <Typography color="primary">Role: {user.admin ? 'Admin' : 'User'}</Typography>
          </Paper>
          <Box sx={{ mt: 7 }}>
            <Typography variant="h5" fontWeight={600} align="center" gutterBottom color="white">All Employees</Typography>
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="primary" /></Box>}
            {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
            {!loading && !error && employees.length === 0 && (
              <Typography align="center" sx={{ mt: 4 }} color="grey.300">No employees found.</Typography>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3, mt: 3 }}>
              {employees
                .filter(emp => String(emp.id) !== String(user.id))
                .map(emp => (
                  <EmployeeCard key={emp.id} emp={emp} />
                ))}
            </Box>
          </Box>
        </Box>
      </Box>
      <Footer />
    </ThemeProvider>
  );
};

export default SwapPage; 