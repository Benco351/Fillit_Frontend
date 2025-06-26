import React, { useEffect, useState, useRef } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { getEmployees } from '../../utils/apis/employeeShiftApis';
import { Employee } from '../../components/CalendarFeatures/calendarStates';
import { MainTheme, swapPageTheme } from '../../assets/themes/themes';
import { useUserDashboard } from '../../hooks/useUserDashboard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/config/routes';
import Footer from '../../components/layout/Footer';
import Navbar from '../../components/layout/userNavbar';
import {
  createShiftSwapRequest,
  listShiftSwapRequests,
  respondToShiftSwapRequest,
  ShiftSwapRequest,
} from '../../utils/apis/shiftSwapRequestApis';

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

const EmployeeCard: React.FC<{ emp: Employee; refreshSwapRequests: () => void }> = ({ emp, refreshSwapRequests }) => {
  const theme = useTheme();
  const { commonButtonStyle } = useUserDashboard({ id: 0, name: '', email: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignedShifts, setAssignedShifts] = useState<any[]>([]);
  const [userShifts, setUserShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOtherShift, setSelectedOtherShift] = useState<number | null>(null);
  const [selectedUserShift, setSelectedUserShift] = useState<number | null>(null);
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapResult, setSwapResult] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  const handleRequestSwap = async () => {
    console.log('Requesting assigned shifts for employee:', emp, 'with id:', emp.id);
    setDialogOpen(true);
    setLoading(true);
    setError(null);
    setSwapResult(null);
    setSelectedOtherShift(null);
    setSelectedUserShift(null);
    try {
      const mod = await import('../../utils/apis/assignedShiftApis');
      const resOther = await mod.getAssignedShifts({ assigned_employee_id: emp.id });
      const assigned = resOther.data?.data || resOther.data || [];
      setAssignedShifts(assigned);
      console.log('Assigned shifts set:', assigned);

      const currentUserId = sessionStorage.getItem('customEmployeeId');
      if (currentUserId) {
        const resUser = await mod.getAssignedShifts({ assigned_employee_id: Number(currentUserId) });
        const userAssigned = resUser.data?.data || resUser.data || [];
        setUserShifts(userAssigned);
      } else {
        setUserShifts([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch assigned shifts');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!selectedOtherShift || !selectedUserShift) return;
    setSwapLoading(true);
    setSwapResult(null);
    setRequestLoading(true);
    try {
      const currentUserId = sessionStorage.getItem('customEmployeeId');
      if (!currentUserId) throw new Error('No user ID');
      await createShiftSwapRequest({
        requester_employee_id: Number(currentUserId),
        target_employee_id: emp.id,
        requester_shift_id: selectedUserShift,
        target_shift_id: selectedOtherShift,
        message: message.trim() || undefined,
      });
      setSwapResult('Swap request sent!');
      setMessage('');
      refreshSwapRequests();
    } catch (err: any) {
      setSwapResult(err.message || 'Swap request failed.');
    } finally {
      setSwapLoading(false);
      setRequestLoading(false);
    }
  };

  return (
    <>

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
          border: swapPageTheme.cardBorder,
          boxShadow: swapPageTheme.cardShadow,
          background: swapPageTheme.cardBg,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px) scale(1.03)',
            background: swapPageTheme.cardHover,
            boxShadow: '0px 8px 30px rgba(0,0,0,0.13)',
          },
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: swapPageTheme.avatarBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            color: swapPageTheme.avatarText,
            mb: 1,
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          {emp.name?.[0] || '?'}
        </Box>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom align="center" color={swapPageTheme.unselectedText}>
          {emp.name}
        </Typography>
        <Typography variant="body2" style={{ color: '#b0b7be' }} align="center">
          ID: {emp.id}
        </Typography>
        <Typography variant="body2" style={{ color: '#b0b7be' }} align="center">
          Email: {emp.email || 'N/A'}
        </Typography>
        <Typography variant="body2" color="primary" fontWeight={500} align="center">
          Role: {emp.admin ? 'Admin' : 'User'}
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <IconButton
            sx={{
              bgcolor: swapPageTheme.iconButtonBg,
              color: swapPageTheme.iconButtonColor,
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: swapPageTheme.iconButtonBoxShadow,
              '&:hover': { bgcolor: 'primary.main' },
              p: 0,
            }}
            aria-label="Chat"
          >
            <ChatIcon fontSize="medium" />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SwapHorizIcon />}
            sx={{
              minWidth: 120,
              borderRadius: 3,
            }}
            onClick={handleRequestSwap}
          >
            Request Swap
          </Button>
        </Stack>
      </Paper>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Swap Shifts with {emp.name}</DialogTitle>
        <DialogContent>
          {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
          {error && <Alert severity="error">{error}</Alert>}
          {!loading && !error && (
            <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom align="center">{emp.name}'s Shifts</Typography>
                {assignedShifts.length === 0 ? (
                  <Typography align="center">No assigned shifts found.</Typography>
                ) : (
                  assignedShifts.map((shift: any) => (
                    <Paper
                      key={shift.assigned_id}
                      sx={{
                        p: 2,
                        mb: 2,
                        background: selectedOtherShift === shift.assigned_id ? swapPageTheme.avatarBg : swapPageTheme.cardBg,
                        color: selectedOtherShift === shift.assigned_id ? swapPageTheme.selectedText : swapPageTheme.unselectedText,
                        cursor: 'pointer',
                        border: selectedOtherShift === shift.assigned_id ? swapPageTheme.selectedBorder : swapPageTheme.unselectedBorder,
                        boxShadow: selectedOtherShift === shift.assigned_id ? swapPageTheme.selectedBoxShadow : swapPageTheme.cardShadow,
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setSelectedOtherShift(shift.assigned_id)}
                    >
                      <Typography>Date: {shift.availableShift?.shift_date || 'N/A'}</Typography>
                      <Typography>Start: {shift.availableShift?.shift_time_start || 'N/A'}</Typography>
                      <Typography>End: {shift.availableShift?.shift_time_end || 'N/A'}</Typography>
                    </Paper>
                  ))
                )}
              </Box>
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom align="center">Your Shifts</Typography>
                {userShifts.length === 0 ? (
                  <Typography align="center">No assigned shifts found.</Typography>
                ) : (
                  userShifts.map((shift: any) => (
                    <Paper
                      key={shift.assigned_id}
                      sx={{
                        p: 2,
                        mb: 2,
                        background: selectedUserShift === shift.assigned_id ? swapPageTheme.avatarBg : swapPageTheme.cardBg,
                        color: selectedUserShift === shift.assigned_id ? swapPageTheme.selectedText : swapPageTheme.unselectedText,
                        cursor: 'pointer',
                        border: selectedUserShift === shift.assigned_id ? swapPageTheme.selectedBorder : swapPageTheme.unselectedBorder,
                        boxShadow: selectedUserShift === shift.assigned_id ? swapPageTheme.selectedBoxShadow : swapPageTheme.cardShadow,
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setSelectedUserShift(shift.assigned_id)}
                    >
                      <Typography>Date: {shift.availableShift?.shift_date || 'N/A'}</Typography>
                      <Typography>Start: {shift.availableShift?.shift_time_start || 'N/A'}</Typography>
                      <Typography>End: {shift.availableShift?.shift_time_end || 'N/A'}</Typography>
                    </Paper>
                  ))
                )}
              </Box>
            </Box>
          )}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Message (optional):</Typography>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={2}
              style={{ width: '100%', borderRadius: 6, border: '1px solid #ccc', padding: 8, marginTop: 4 }}
              placeholder="Add a message to your swap request..."
              disabled={swapLoading}
            />
          </Box>
          {swapResult && (
            <Alert severity={swapResult === 'Swap successful!' ? 'success' : 'error'} sx={{ mt: 2 }}>{swapResult}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button
            onClick={handleSwap}
            variant="contained"
            color="primary"
            disabled={!selectedOtherShift || !selectedUserShift || swapLoading || requestLoading}
          >
            {swapLoading || requestLoading ? <CircularProgress size={22} color="inherit" /> : 'Request Swap'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const SwapPage: React.FC = () => {
  const user = getCurrentUser();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { commonButtonStyle } = useUserDashboard({ id: 0, name: '', email: '' });
  const navigate = useNavigate();
  const [myRequests, setMyRequests] = useState<ShiftSwapRequest[]>([]);
  const [requestsToMe, setRequestsToMe] = useState<ShiftSwapRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  const fetchSwapRequests = async () => {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const currentUserId = Number(user.id);
      const res = await listShiftSwapRequests(currentUserId);
      const all: ShiftSwapRequest[] = res.data?.data || res.data || [];
      setMyRequests(all.filter(r => r.requester_employee_id === currentUserId));
      setRequestsToMe(all.filter(r => r.target_employee_id === currentUserId));
    } catch (err: any) {
      setRequestsError(err.message || 'Failed to fetch swap requests');
    } finally {
      setRequestsLoading(false);
    }
  };

  // Use a ref for refreshSwapRequests to avoid window assignment
  const refreshSwapRequests = useRef(() => {});
  refreshSwapRequests.current = fetchSwapRequests;

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

  useEffect(() => {
    fetchSwapRequests();
  }, []);

  return (
    <ThemeProvider theme={MainTheme}>
      <CssBaseline />
      <Box sx={{ 
        backgroundColor: user.admin ? swapPageTheme.adminBg : swapPageTheme.mainBg, 
        minHeight: '100vh', 
        py: 4, 
        px: 2 
      }}>
        <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 3 }, width: '100%', maxWidth: '100%' }}>
          <Navbar />
          {/* Return Button
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              if (user.admin) {
                navigate(ROUTES.ADMIN);
              } else {
                navigate(ROUTES.DASHBOARD);
              }
            }}
            sx={{ ...commonButtonStyle, mb: 3, bgcolor: 'primary.main', color: 'white', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            Back to Dashboard
          </Button> */}
          {/* Main Content Card/Frame */}
          <Box
            sx={{
              border: swapPageTheme.mainBorder,
              borderRadius: '12px',
              padding: { xs: 2, sm: 3, md: 4 },
              backgroundColor: swapPageTheme.mainBg,
              boxShadow: swapPageTheme.mainBoxShadow,
              margin: '24px 0',
              transform: 'translateZ(0)',
              willChange: 'transform',
            }}
          >
            <Typography variant="h3" fontWeight={700} color="primary" align="center" gutterBottom>
              Swap Shifts
            </Typography>
            <Typography variant="body1" align="center" style={{ color: '#b0b7be', marginBottom: 24 }}>
              Connect with other employees to chat and request shift swaps.
            </Typography>
            <Paper sx={{ mt: 2, mb: 4, p: { xs: 2, sm: 3 }, display: 'inline-block', minWidth: 300, borderRadius: 3, mx: 'auto', background: swapPageTheme.infoPaperBg, border: swapPageTheme.cardBorder, boxShadow: swapPageTheme.cardShadow }} elevation={0}>
              <Typography variant="h6" gutterBottom align="center" color={swapPageTheme.unselectedText}>Current User Info</Typography>
              <Typography style={{ color: swapPageTheme.unselectedText }}>Name: {user.name}</Typography>
              <Typography style={{ color: '#b0b7be' }}>Email: {user.email}</Typography>
              <Typography style={{ color: '#b0b7be' }}>User ID: {user.id}</Typography>
              <Typography color="primary">Role: {user.admin ? 'Admin' : 'User'}</Typography>
            </Paper>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" fontWeight={600} align="center" gutterBottom style={{ color: swapPageTheme.unselectedText }}>All Employees</Typography>
              {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="primary" /></Box>}
              {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
              {!loading && !error && employees.length === 0 && (
                <Typography align="center" sx={{ mt: 4 }} style={{ color: '#b0b7be' }}>No employees found.</Typography>
              )}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  flexWrap: 'wrap',
                  gap: 3,
                  mt: 3,
                  justifyContent: 'center',
                }}
              >
                {employees
                  .filter(emp => String(emp.id) !== String(user.id))
                  .map(emp => (
                    <EmployeeCard key={emp.id} emp={emp} refreshSwapRequests={refreshSwapRequests.current} />
                  ))}
              </Box>
            </Box>
            {/* Swap Requests Section */}
            <Box sx={{ mt: 6 }}>
              <Typography variant="h5" fontWeight={600} align="center" gutterBottom style={{ color: swapPageTheme.unselectedText }}>My Swap Requests</Typography>
              {requestsLoading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress color="primary" /></Box>}
              {requestsError && <Alert severity="error" sx={{ mt: 2 }}>{requestsError}</Alert>}
              {!requestsLoading && !requestsError && myRequests.length === 0 && (
                <Typography align="center" sx={{ mt: 2 }} style={{ color: '#b0b7be' }}>No swap requests sent.</Typography>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, justifyContent: 'center' }}>
                {myRequests.map(req => (
                  <Paper key={req.id} sx={{ p: 2, minWidth: 260, borderRadius: 2, background: swapPageTheme.cardBg, border: swapPageTheme.cardBorder }}>
                    <Typography fontWeight={600}>To Employee ID: {req.target_employee_id}</Typography>
                    <Typography>My Shift ID: {req.requester_shift_id}</Typography>
                    <Typography>Their Shift ID: {req.target_shift_id}</Typography>
                    <Typography>Status: {req.status}</Typography>
                    {req.message && <Typography sx={{ fontStyle: 'italic', color: '#888' }}>Message: {req.message}</Typography>}
                    {req.status === 'pending' && (
                      <Button
                        size="small"
                        color="error"
                        sx={{ mt: 1 }}
                        onClick={async () => {
                          await respondToShiftSwapRequest(req.id, { status: 'cancelled' });
                          fetchSwapRequests();
                        }}
                      >Cancel</Button>
                    )}
                  </Paper>
                ))}
              </Box>
            </Box>
            <Box sx={{ mt: 6 }}>
              <Typography variant="h5" fontWeight={600} align="center" gutterBottom style={{ color: swapPageTheme.unselectedText }}>Requests to Me</Typography>
              {requestsLoading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress color="primary" /></Box>}
              {requestsError && <Alert severity="error" sx={{ mt: 2 }}>{requestsError}</Alert>}
              {!requestsLoading && !requestsError && requestsToMe.length === 0 && (
                <Typography align="center" sx={{ mt: 2 }} style={{ color: '#b0b7be' }}>No swap requests received.</Typography>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, justifyContent: 'center' }}>
                {requestsToMe.map(req => (
                  <Paper key={req.id} sx={{ p: 2, minWidth: 260, borderRadius: 2, background: swapPageTheme.cardBg, border: swapPageTheme.cardBorder }}>
                    <Typography fontWeight={600}>From Employee ID: {req.requester_employee_id}</Typography>
                    <Typography>Their Shift ID: {req.requester_shift_id}</Typography>
                    <Typography>My Shift ID: {req.target_shift_id}</Typography>
                    <Typography>Status: {req.status}</Typography>
                    {req.message && <Typography sx={{ fontStyle: 'italic', color: '#888' }}>Message: {req.message}</Typography>}
                    {req.status === 'pending' && (
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          color="success"
                          onClick={async () => {
                            await respondToShiftSwapRequest(req.id, { status: 'accepted' });
                            fetchSwapRequests();
                          }}
                        >Accept</Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={async () => {
                            await respondToShiftSwapRequest(req.id, { status: 'rejected' });
                            fetchSwapRequests();
                          }}
                        >Reject</Button>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
        
      </Box>
      <Footer />
    </ThemeProvider>
  );
};

export default SwapPage; 