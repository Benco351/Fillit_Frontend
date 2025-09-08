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
  TextField,
  Pagination,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import { getEmployees } from '../../utils/apis/employeeShiftApis';
import { Employee } from '../../components/CalendarFeatures/calendarStates';
import { MainTheme, swapPageTheme } from '../../assets/themes/themes';
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
import { getRequestedShifts, deleteRequestedShiftById } from '../../utils/apis/requestedShiftsApis';

import { getDepartments } from '../../utils/apis/departmentApis';

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
  const navigate = useNavigate();
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
  // Departments state
  const [departments, setDepartments] = useState<{ id: number; name: string; address?: string }[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departmentsResponse = await getDepartments();
        if (departmentsResponse?.data && Array.isArray(departmentsResponse.data)) {
          setDepartments(departmentsResponse.data);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchDepartments();
  }, []);

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
      let assigned = resOther.data?.data || resOther.data || [];
      // Map department_id from nested availableShift if present
      assigned = assigned.map((shift: any) => ({
        ...shift,
        availableShift: {
          ...shift.availableShift,
          department_id:
            shift.availableShift?.department_id ||
            shift.availableShift?.department?.department_id ||
            shift.department_id,
          department_name: shift.availableShift?.department?.department_name,
          department_address: shift.availableShift?.department?.department_address,
        },
      }));
      setAssignedShifts(assigned);
      console.log('Assigned shifts set:', assigned);

      const currentUserId = sessionStorage.getItem('customEmployeeId');
      if (currentUserId) {
        const resUser = await mod.getAssignedShifts({ assigned_employee_id: Number(currentUserId) });
        let userAssigned = resUser.data?.data || resUser.data || [];
        userAssigned = userAssigned.map((shift: any) => ({
          ...shift,
          availableShift: {
            ...shift.availableShift,
            department_id:
              shift.availableShift?.department_id ||
              shift.availableShift?.department?.department_id ||
              shift.department_id,
            department_name: shift.availableShift?.department?.department_name,
            department_address: shift.availableShift?.department?.department_address,
          },
        }));
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

  const handleCardClick = () => {
    navigate(`${ROUTES.EMPLOYEE_INFO.replace(':employeeId', emp.id.toString())}`, {
      state: { fromPage: window.location.pathname }
    });
  };

  return (
    <>

      <Paper
        elevation={0}
        onClick={handleCardClick}
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
          cursor: 'pointer',
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
          Click to view details
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          {/* <IconButton
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
          </IconButton> */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<SwapHorizIcon />}
            sx={{
              minWidth: 120,
              borderRadius: 3,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleRequestSwap();
            }}
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
                <Typography variant="subtitle1" color="primary" gutterBottom align="center">{emp.name}s Shifts</Typography>
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
                      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                        <Box>
                          <Typography>Date: {shift.availableShift?.shift_date || 'N/A'}</Typography>
                          <Typography>Start: {shift.availableShift?.shift_time_start || 'N/A'}</Typography>
                          <Typography>End: {shift.availableShift?.shift_time_end || 'N/A'}</Typography>
                        </Box>
                        <Box sx={{ minWidth: 120, textAlign: 'right' }}>
                          {(shift.availableShift?.department_name || shift.availableShift?.department_id) ? (
                            <>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: selectedOtherShift === shift.assigned_id ? '#111' : '#00c28c',
                                  fontWeight: 500,
                                  fontSize: selectedOtherShift === shift.assigned_id ? '1.1rem' : '0.9rem',
                                  transition: 'color 0.2s, font-size 0.2s',
                                }}
                              >
                                {shift.availableShift?.department_name ||
                                  departments.find(d => d.id === shift.availableShift.department_id)?.name ||
                                  'Department'}
                              </Typography>
                              {shift.availableShift?.department_address && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: selectedOtherShift === shift.assigned_id ? '#111' : '#00c28c',
                                    fontWeight: 400,
                                    fontSize: selectedOtherShift === shift.assigned_id ? '1.05rem' : '0.9rem',
                                    display: 'block',
                                    transition: 'color 0.2s, font-size 0.2s',
                                  }}
                                >
                                  {shift.availableShift.department_address}
                                </Typography>
                              )}
                            </>
                          ) : (
                            <Typography variant="caption" sx={{ color: '#bdbdbd' }}>No Department</Typography>
                          )}
                        </Box>
                      </Box>
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
                      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                        <Box>
                          <Typography>Date: {shift.availableShift?.shift_date || 'N/A'}</Typography>
                          <Typography>Start: {shift.availableShift?.shift_time_start || 'N/A'}</Typography>
                          <Typography>End: {shift.availableShift?.shift_time_end || 'N/A'}</Typography>
                        </Box>
                        <Box sx={{ minWidth: 120, textAlign: 'right' }}>
                          {(shift.availableShift?.department_name || shift.availableShift?.department_id) ? (
                            <>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: selectedUserShift === shift.assigned_id ? '#111' : '#00c28c',
                                  fontWeight: 500,
                                  fontSize: selectedUserShift === shift.assigned_id ? '1.1rem' : '0.9rem',
                                  transition: 'color 0.2s, font-size 0.2s',
                                }}
                              >
                                {shift.availableShift?.department_name ||
                                  departments.find(d => d.id === shift.availableShift.department_id)?.name ||
                                  'Department'}
                              </Typography>
                              {shift.availableShift?.department_address && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: selectedUserShift === shift.assigned_id ? '#111' : '#00c28c',
                                    fontWeight: 400,
                                    fontSize: selectedUserShift === shift.assigned_id ? '1.05rem' : '0.9rem',
                                    display: 'block',
                                    transition: 'color 0.2s, font-size 0.2s',
                                  }}
                                >
                                  {shift.availableShift.department_address}
                                </Typography>
                              )}
                            </>
                          ) : (
                            <Typography variant="caption" sx={{ color: '#bdbdbd' }}>No Department</Typography>
                          )}
                        </Box>
                      </Box>
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
            <Alert severity={swapResult === 'Swap request sent!' ? 'success' : 'error'} sx={{ mt: 2 }}>{swapResult}</Alert>
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

// Function to delete requested shifts that correspond to swapped assigned shifts
const deleteCorrespondingRequestedShifts = async (swapRequest: ShiftSwapRequest) => {
  try {
    // First, we need to get the assigned shift details to find the available shift IDs
    const assignedShiftMod = await import('../../utils/apis/assignedShiftApis');
    
    // Get the assigned shift details for both shifts being swapped
    const requesterAssignedShift = await assignedShiftMod.getAssignedShiftById(swapRequest.requester_shift_id);
    const targetAssignedShift = await assignedShiftMod.getAssignedShiftById(swapRequest.target_shift_id);
    
    // Extract the available shift IDs from the assigned shifts
    const requesterAvailableShiftId = requesterAssignedShift.data?.assigned_shift_id;
    const targetAvailableShiftId = targetAssignedShift.data?.assigned_shift_id;
    
    console.log('🔍 Swap request details:', {
      swapRequestId: swapRequest.id,
      requesterEmployeeId: swapRequest.requester_employee_id,
      targetEmployeeId: swapRequest.target_employee_id,
      requesterAssignedShiftId: swapRequest.requester_shift_id,
      targetAssignedShiftId: swapRequest.target_shift_id,
      requesterAvailableShiftId,
      targetAvailableShiftId
    });
    
    if (!requesterAvailableShiftId || !targetAvailableShiftId) {
      console.warn('❌ Could not find available shift IDs for assigned shifts');
      return;
    }

    // Get all requested shifts for both employees involved in the swap
    const requesterRequestedShifts = await getRequestedShifts({ 
      request_employee_id: swapRequest.requester_employee_id 
    });
    const targetRequestedShifts = await getRequestedShifts({ 
      request_employee_id: swapRequest.target_employee_id 
    });

    // Find requested shifts that correspond to the swapped assigned shifts
    // We need to find requested shifts where:
    // 1. The employee matches the swap participants
    // 2. The availableShiftId matches the available shift ID from the assigned shift
    // 3. The status is 'approved' (meaning it was approved and created an assigned shift)

    const requesterShiftsToDelete = requesterRequestedShifts.data?.filter(shift => 
      shift.employeeId === swapRequest.requester_employee_id &&
      shift.availableShiftId === requesterAvailableShiftId &&
      shift.status === 'approved'
    ) || [];

    const targetShiftsToDelete = targetRequestedShifts.data?.filter(shift => 
      shift.employeeId === swapRequest.target_employee_id &&
      shift.availableShiftId === targetAvailableShiftId &&
      shift.status === 'approved'
    ) || [];

    // Delete the corresponding requested shifts
    const deletePromises = [
      ...requesterShiftsToDelete.map(shift => deleteRequestedShiftById(shift.id)),
      ...targetShiftsToDelete.map(shift => deleteRequestedShiftById(shift.id))
    ];

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      console.log(`✅ Deleted ${deletePromises.length} requested shifts after swap approval:`, {
        requesterShiftsDeleted: requesterShiftsToDelete.length,
        targetShiftsDeleted: targetShiftsToDelete.length,
        swapRequestId: swapRequest.id
      });
    } else {
      console.log('ℹ️ No requested shifts found to delete for swap request:', swapRequest.id);
    }
  } catch (error) {
    console.error('Error in deleteCorrespondingRequestedShifts:', error);
    throw error;
  }
};

// Info Dialog Component for Pending Requests
const PendingRequestInfoDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  request: ShiftSwapRequest | null;
  employeeDetails: {[key: number]: Employee};
  shiftDetails: {[key: number]: any};
  isMyRequest: boolean;
}> = ({ open, onClose, request, employeeDetails, shiftDetails, isMyRequest }) => {
  if (!request) return null;

  const otherEmployeeId = isMyRequest ? request.target_employee_id : request.requester_employee_id;
  const otherEmployee = employeeDetails[otherEmployeeId];
  const myShiftId = isMyRequest ? request.requester_shift_id : request.target_shift_id;
  const theirShiftId = isMyRequest ? request.target_shift_id : request.requester_shift_id;
  const myShiftDetail = shiftDetails[myShiftId];
  const theirShiftDetail = shiftDetails[theirShiftId];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="primary" />
          <Typography variant="h6">
            {isMyRequest ? 'My Pending Swap Request' : 'Pending Request to Me'}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Employee Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Employee Information
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
              <Typography variant="body1" fontWeight={600}>
                {otherEmployee?.name || `Employee ID: ${otherEmployeeId}`}
              </Typography>
              {otherEmployee?.email && (
                <Typography variant="body2" color="text.secondary">
                  Email: {otherEmployee.email}
                </Typography>
              )}
            </Paper>
          </Box>

          {/* Shift Details */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* My Shift */}
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <Typography variant="h6" gutterBottom color="primary">
                {isMyRequest ? 'My Shift' : 'Their Shift'}
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                {myShiftDetail?.availableShift ? (
                  <>
                    <Typography variant="body2">
                      <strong>Date:</strong> {myShiftDetail.availableShift.shift_date || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Time:</strong> {myShiftDetail.availableShift.shift_time_start || 'N/A'} - {myShiftDetail.availableShift.shift_time_end || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Department:</strong> {myShiftDetail.availableShift.department_name || 'N/A'}
                    </Typography>
                    {myShiftDetail.availableShift.department_address && (
                      <Typography variant="body2">
                        <strong>Address:</strong> {myShiftDetail.availableShift.department_address}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Shift details not available
                  </Typography>
                )}
              </Paper>
            </Box>

            {/* Their Shift */}
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <Typography variant="h6" gutterBottom color="primary">
                {isMyRequest ? 'Their Shift' : 'My Shift'}
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                {theirShiftDetail?.availableShift ? (
                  <>
                    <Typography variant="body2">
                      <strong>Date:</strong> {theirShiftDetail.availableShift.shift_date || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Time:</strong> {theirShiftDetail.availableShift.shift_time_start || 'N/A'} - {theirShiftDetail.availableShift.shift_time_end || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Department:</strong> {theirShiftDetail.availableShift.department_name || 'N/A'}
                    </Typography>
                    {theirShiftDetail.availableShift.department_address && (
                      <Typography variant="body2">
                        <strong>Address:</strong> {theirShiftDetail.availableShift.department_address}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Shift details not available
                  </Typography>
                )}
              </Paper>
            </Box>
          </Box>

          {/* Message */}
          {request.message && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Message
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  {request.message}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Status */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Status
            </Typography>
            <Typography
              variant="body1"
              sx={{
                px: 2,
                py: 1,
                borderRadius: '8px',
                backgroundColor: request.status === 'pending' ? '#2196f3' : 
                               request.status === 'accepted' ? '#00c28c' : 
                               request.status === 'rejected' ? '#f44336' : '#ff9800',
                color: 'white',
                fontWeight: 600,
                textTransform: 'uppercase',
                display: 'inline-block',
              }}
            >
              {request.status}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SwapPage: React.FC = () => {
  const user = getCurrentUser();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [myRequests, setMyRequests] = useState<ShiftSwapRequest[]>([]);
  const [requestsToMe, setRequestsToMe] = useState<ShiftSwapRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  
  // Shift swap log states
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [allSwapRequests, setAllSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [shiftDetails, setShiftDetails] = useState<{[key: number]: any}>({});
  
  // Pagination and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 5;
  
  // Info dialog states for pending requests
  const [pendingRequestInfoOpen, setPendingRequestInfoOpen] = useState(false);
  const [selectedPendingRequest, setSelectedPendingRequest] = useState<ShiftSwapRequest | null>(null);
  const [pendingRequestEmployeeDetails, setPendingRequestEmployeeDetails] = useState<{[key: number]: Employee}>({});

  const fetchSwapRequests = async (showLoading = false) => {
    if (showLoading) {
      setRequestsLoading(true);
    }
    setRequestsError(null);
    try {
      const currentUserId = Number(user.id);
      const res = await listShiftSwapRequests(currentUserId);
      const all: ShiftSwapRequest[] = res.data?.data || res.data || [];
      const newMyRequests = all.filter(r => r.requester_employee_id === currentUserId);
      const newRequestsToMe = all.filter(r => r.target_employee_id === currentUserId);
      
      // Only update state if data has actually changed
      const myRequestsChanged = JSON.stringify(newMyRequests) !== JSON.stringify(myRequests);
      const requestsToMeChanged = JSON.stringify(newRequestsToMe) !== JSON.stringify(requestsToMe);
      
      if (myRequestsChanged) {
        setMyRequests(newMyRequests);
      }
      if (requestsToMeChanged) {
        setRequestsToMe(newRequestsToMe);
      }
      
      // Fetch employee details for pending requests
      await fetchEmployeeDetailsForPendingRequests(newMyRequests, newRequestsToMe);
    } catch (err: any) {
      setRequestsError(err.message || 'Failed to fetch swap requests');
    } finally {
      if (showLoading) {
        setRequestsLoading(false);
      }
    }
  };

  const fetchEmployeeDetailsForPendingRequests = async (myRequests: ShiftSwapRequest[], requestsToMe: ShiftSwapRequest[]) => {
    try {
      const employeeIds = new Set<number>();
      const shiftIds = new Set<number>();
      
      // Collect all unique employee IDs and shift IDs from pending requests
      myRequests.filter(req => req.status === 'pending').forEach(req => {
        employeeIds.add(req.target_employee_id);
        shiftIds.add(req.requester_shift_id);
        shiftIds.add(req.target_shift_id);
      });
      requestsToMe.filter(req => req.status === 'pending').forEach(req => {
        employeeIds.add(req.requester_employee_id);
        shiftIds.add(req.requester_shift_id);
        shiftIds.add(req.target_shift_id);
      });
      
      // Fetch employee details from API if we have employee IDs to fetch
      if (employeeIds.size > 0) {
        const employeeDetailsMap: {[key: number]: Employee} = {};
        
        // First try to find in existing employees array
        for (const employeeId of employeeIds) {
          const employee = employees.find(emp => emp.id === employeeId);
          if (employee) {
            employeeDetailsMap[employeeId] = employee;
          }
        }
        
        // If we still have missing employees, fetch them from API
        const missingEmployeeIds = Array.from(employeeIds).filter(id => !employeeDetailsMap[id]);
        if (missingEmployeeIds.length > 0) {
          try {
            const res = await getEmployees();
            const allEmployees = (res.data || []).map((emp: any) => ({
              id: emp.employee_id || emp.id,
              name: emp.employee_name || emp.name,
              email: emp.employee_email || emp.email,
              admin: emp.employee_admin || emp.admin,
              phone: emp.employee_phone || emp.phone,
            }));
            
            // Add missing employees to the map
            for (const employeeId of missingEmployeeIds) {
              const employee = allEmployees.find((emp: Employee) => emp.id === employeeId);
              if (employee) {
                employeeDetailsMap[employeeId] = employee;
              }
            }
          } catch (err) {
            console.error('Failed to fetch missing employees:', err);
          }
        }
        
        setPendingRequestEmployeeDetails(employeeDetailsMap);
      }
      
      // Fetch shift details for pending requests
      await fetchShiftDetailsForPendingRequests(Array.from(shiftIds));
    } catch (err) {
      console.error('Failed to fetch employee details for pending requests:', err);
    }
  };

  const fetchShiftDetailsForPendingRequests = async (shiftIds: number[]) => {
    try {
      const mod = await import('../../utils/apis/assignedShiftApis');
      const shiftDetailsMap: {[key: number]: any} = {};
      
      // Fetch shift details for each shift ID
      for (const shiftId of shiftIds) {
        try {
          const shiftRes = await mod.getAssignedShiftById(shiftId);
          if (shiftRes.data) {
            let shift = shiftRes.data;
            
            // Apply the same mapping as in fetchAllSwapRequests
            shift = {
              ...shift,
              availableShift: {
                ...shift.availableShift,
                department_id:
                  shift.availableShift?.department_id ||
                  shift.availableShift?.department?.department_id ||
                  shift.department_id,
                department_name: shift.availableShift?.department?.department_name,
                department_address: shift.availableShift?.department?.department_address,
              },
            };
            
            shiftDetailsMap[shiftId] = shift;
          }
        } catch (err) {
          console.error(`Failed to fetch shift details for shift ${shiftId}:`, err);
        }
      }
      
      // Update shift details state
      setShiftDetails(prev => ({ ...prev, ...shiftDetailsMap }));
    } catch (err) {
      console.error('Failed to fetch shift details for pending requests:', err);
    }
  };

  const fetchAllSwapRequests = async (showLoading = false) => {
    if (showLoading) {
      setLogLoading(true);
    }
    setLogError(null);
    try {
      const currentUserId = Number(user.id);
      const res = await listShiftSwapRequests(currentUserId);
      const all: ShiftSwapRequest[] = res.data?.data || res.data || [];
      // Sort by created_at in descending order (most recent first)
      const sorted = all.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Only update state if data has actually changed
      const dataChanged = JSON.stringify(sorted) !== JSON.stringify(allSwapRequests);
      if (dataChanged) {
        setAllSwapRequests(sorted);
      }
      
      // Fetch shift details for all requests using the exact same method as employee cards
      const shiftDetailsMap: {[key: number]: any} = {};
      const mod = await import('../../utils/apis/assignedShiftApis');
      
      // Get all unique employee IDs from the requests
      const employeeIds = new Set<number>();
      sorted.forEach(request => {
        employeeIds.add(request.requester_employee_id);
        employeeIds.add(request.target_employee_id);
      });
      
      // Fetch all shifts for all employees at once and apply the same mapping as employee cards
      for (const employeeId of employeeIds) {
        try {
          const shiftsRes = await mod.getAssignedShifts({ assigned_employee_id: employeeId });
          let shifts = shiftsRes.data?.data || shiftsRes.data || [];
          
          // Apply the exact same mapping as employee cards
          shifts = shifts.map((shift: any) => ({
            ...shift,
            availableShift: {
              ...shift.availableShift,
              department_id:
                shift.availableShift?.department_id ||
                shift.availableShift?.department?.department_id ||
                shift.department_id,
              department_name: shift.availableShift?.department?.department_name,
              department_address: shift.availableShift?.department?.department_address,
            },
          }));
          
          // Store each shift with its assigned_id as the key
          shifts.forEach((shift: any) => {
            shiftDetailsMap[shift.assigned_id] = shift;
          });
        } catch (err) {
          console.error('Failed to fetch shifts for employee:', employeeId);
        }
      }
      
      // Only update shift details if they have changed
      const shiftDetailsChanged = JSON.stringify(shiftDetailsMap) !== JSON.stringify(shiftDetails);
      if (shiftDetailsChanged) {
        setShiftDetails(shiftDetailsMap);
      }
    } catch (err: any) {
      setLogError(err.message || 'Failed to fetch swap requests');
    } finally {
      if (showLoading) {
        setLogLoading(false);
      }
    }
  };

  // Use a ref for refreshSwapRequests to avoid window assignment
  // eslint-disable-next-line @typescript-eslint/no-empty-function
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
    fetchSwapRequests(true); // Show loading on initial fetch
  }, []);

  // Fetch employee details for pending requests when both employees and swap requests are available
  useEffect(() => {
    if (employees.length > 0 && (myRequests.length > 0 || requestsToMe.length > 0)) {
      fetchEmployeeDetailsForPendingRequests(myRequests, requestsToMe);
    }
  }, [employees, myRequests, requestsToMe]);

  // Poll for new swap requests every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Silent background refresh - no polling indicator to avoid flickering
      fetchSwapRequests(false);
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Poll for all swap requests when log dialog is open (every 15 seconds)
  useEffect(() => {
    if (!logDialogOpen) return;

    const interval = setInterval(() => {
      fetchAllSwapRequests(false); // Don't show loading during polling
    }, 15000); // Poll every 15 seconds when dialog is open

    return () => clearInterval(interval);
  }, [logDialogOpen]);

  // Filter employees based on search term
  const filteredEmployees = employees.filter(emp => 
    String(emp.id) !== String(user.id) && 
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const startIndex = (currentPage - 1) * employeesPerPage;
  const endIndex = startIndex + employeesPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <ThemeProvider theme={MainTheme}>
      <CssBaseline />
      <Box sx={{ 
        backgroundColor: user.admin ? swapPageTheme.adminBg : '#093039', 
        minHeight: '100vh', 
        py: 4, 
        px: 2 
      }}>
        <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 3 }, width: '100%', maxWidth: '100%' }}>
          <Navbar />
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
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, minWidth: 300, borderRadius: 3, background: swapPageTheme.infoPaperBg, border: swapPageTheme.cardBorder, boxShadow: swapPageTheme.cardShadow }} elevation={0}>
                <Typography variant="h6" gutterBottom align="center" color={swapPageTheme.unselectedText}>Current User Info</Typography>
                <Typography style={{ color: swapPageTheme.unselectedText }}>Name: {user.name}</Typography>
                <Typography style={{ color: '#b0b7be' }}>Email: {user.email}</Typography>
                <Typography style={{ color: '#b0b7be' }}>User ID: {user.id}</Typography>
                <Typography color="primary">Role: {user.admin ? 'Admin' : 'User'}</Typography>
              </Paper>
            </Box>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" fontWeight={600} align="center" gutterBottom style={{ color: swapPageTheme.unselectedText }}>All Employees</Typography>
              
              {/* Search Field */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <TextField
                  placeholder="Search employees by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    minWidth: 300,
                    maxWidth: 500,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        opacity: 1,
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Box>

              {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="primary" /></Box>}
              {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
              {!loading && !error && filteredEmployees.length === 0 && (
                <Typography align="center" sx={{ mt: 4 }} style={{ color: '#b0b7be' }}>
                  {searchTerm ? 'No employees found matching your search.' : 'No employees found.'}
                </Typography>
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
                {currentEmployees.map(emp => (
                  <EmployeeCard key={emp.id} emp={emp} refreshSwapRequests={refreshSwapRequests.current} />
                ))}
              </Box>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(event, page) => setCurrentPage(page)}
                    color="primary"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
            {/* Swap Requests Section */}
            <Box sx={{ mt: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h5" fontWeight={600} style={{ color: swapPageTheme.unselectedText }}>My Pending Swap Requests</Typography>
              </Box>
              {requestsError && <Alert severity="error" sx={{ mt: 2 }}>{requestsError}</Alert>}
              {!requestsError && myRequests.filter(req => req.status === 'pending').length === 0 && (
                <Typography align="center" sx={{ mt: 2 }} style={{ color: '#b0b7be' }}>No pending swap requests sent.</Typography>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, justifyContent: 'center' }}>
                {myRequests.filter(req => req.status === 'pending').map(req => {
                  const targetEmployee = pendingRequestEmployeeDetails[req.target_employee_id];
                  return (
                    <Paper key={req.id} sx={{ p: 2, minWidth: 260, borderRadius: 2, background: swapPageTheme.cardBg, border: swapPageTheme.cardBorder }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography fontWeight={600}>
                          To: {targetEmployee?.name || `Employee ID: ${req.target_employee_id}`}
                        </Typography>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedPendingRequest(req);
                              setPendingRequestInfoOpen(true);
                            }}
                            sx={{ color: '#00c28c' }}
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Status: {req.status}
                      </Typography>
                      {req.message && (
                        <Typography sx={{ fontStyle: 'italic', color: '#888', mt: 1 }} variant="body2">
                          Message: {req.message}
                        </Typography>
                      )}
                      <Button
                        size="small"
                        color="error"
                        sx={{ mt: 1 }}
                        onClick={async () => {
                          await respondToShiftSwapRequest(req.id, { status: 'cancelled' });
                          fetchSwapRequests(false); // Don't show loading for manual actions
                        }}
                      >
                        Cancel
                      </Button>
                    </Paper>
                  );
                })}
              </Box>
            </Box>
            <Box sx={{ mt: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h5" fontWeight={600} style={{ color: swapPageTheme.unselectedText }}>Pending Requests to Me</Typography>
              </Box>
              {requestsError && <Alert severity="error" sx={{ mt: 2 }}>{requestsError}</Alert>}
              {!requestsError && requestsToMe.filter(req => req.status === 'pending').length === 0 && (
                <Typography align="center" sx={{ mt: 2 }} style={{ color: '#b0b7be' }}>No pending swap requests received.</Typography>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, justifyContent: 'center' }}>
                {requestsToMe.filter(req => req.status === 'pending').map(req => {
                  const requesterEmployee = pendingRequestEmployeeDetails[req.requester_employee_id];
                  return (
                    <Paper key={req.id} sx={{ p: 2, minWidth: 260, borderRadius: 2, background: swapPageTheme.cardBg, border: swapPageTheme.cardBorder }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography fontWeight={600}>
                          From: {requesterEmployee?.name || `Employee ID: ${req.requester_employee_id}`}
                        </Typography>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedPendingRequest(req);
                              setPendingRequestInfoOpen(true);
                            }}
                            sx={{ color: '#00c28c' }}
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Status: {req.status}
                      </Typography>
                      {req.message && (
                        <Typography sx={{ fontStyle: 'italic', color: '#888', mt: 1 }} variant="body2">
                          Message: {req.message}
                        </Typography>
                      )}
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          color="success"
                          onClick={async () => {
                            await respondToShiftSwapRequest(req.id, { status: 'accepted' });
                            
                            // After swap approval, delete corresponding requested shifts
                            try {
                              await deleteCorrespondingRequestedShifts(req);
                            } catch (error) {
                              console.error('Error deleting requested shifts after swap:', error);
                              // Don't block the swap approval if this fails
                              // The swap has already been approved, so we just log the error
                            }
                            
                            fetchSwapRequests(false); // Don't show loading for manual actions
                          }}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={async () => {
                            await respondToShiftSwapRequest(req.id, { status: 'rejected' });
                            fetchSwapRequests(false); // Don't show loading for manual actions
                          }}
                        >
                          Reject
                        </Button>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            </Box>
            
            {/* Shift Swap Log Button */}
            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => {
                  setLogDialogOpen(true);
                  fetchAllSwapRequests(true); // Show loading when manually opening dialog
                }}
                sx={{
                  background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.1), rgba(0, 194, 140, 0.2))',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(0, 194, 140, 0.3)',
                  borderRadius: '10px',
                  color: '#00c28c',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.15), rgba(0, 194, 140, 0.25))',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 20px rgba(0, 194, 140, 0.3)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                View Complete Swap History
              </Button>
            </Box>
          </Box>
        </Container>
        
        {/* Shift Swap Log Dialog */}
        <Dialog 
          open={logDialogOpen} 
          onClose={() => setLogDialogOpen(false)} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: {
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
            }
          }}
        >
          <DialogTitle>
            <Typography variant="h5" fontWeight={700} color="primary">
              Shift Swap History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete history of all swap requests
            </Typography>
          </DialogTitle>
          <DialogContent>
            {logLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress color="primary" />
              </Box>
            )}
            {logError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {logError}
              </Alert>
            )}
            {!logLoading && !logError && allSwapRequests.length === 0 && (
              <Typography align="center" sx={{ my: 4 }} color="text.secondary">
                No swap requests found.
              </Typography>
            )}
            {!logLoading && !logError && allSwapRequests.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {allSwapRequests.map((request) => {
                  const isRequester = request.requester_employee_id === Number(user.id);
                  const isTarget = request.target_employee_id === Number(user.id);
                  const otherEmployeeId = isRequester ? request.target_employee_id : request.requester_employee_id;
                  const otherEmployee = employees.find(emp => emp.id === otherEmployeeId);
                  
                  return (
                    <Paper
                      key={request.id}
                      sx={{
                        p: 3,
                        mb: 2,
                        background: '#ffffff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
                        borderLeft: '4px solid',
                        borderLeftColor: request.status === 'accepted' ? '#00c28c' : 
                                        request.status === 'rejected' ? '#f44336' : 
                                        request.status === 'cancelled' ? '#ff9800' : '#2196f3',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight={600} color="text.primary">
                            {isRequester ? 'You requested a swap' : 'You received a swap request'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            with {otherEmployee?.name || `Employee ID: ${otherEmployeeId}`}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography
                            variant="body2"
                            sx={{
                              px: 2,
                              py: 0.5,
                              borderRadius: '8px',
                              backgroundColor: request.status === 'accepted' ? '#00c28c' : 
                                             request.status === 'rejected' ? '#f44336' : 
                                             request.status === 'cancelled' ? '#ff9800' : '#2196f3',
                              color: 'white',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              fontSize: '0.75rem',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {request.status}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: 1, minWidth: 250 }}>
                          <Typography variant="subtitle2" color="primary" fontWeight={600}>
                            {isRequester ? 'Your Shift' : 'Their Shift'}:
                          </Typography>
                          {(() => {
                            const shiftId = isRequester ? request.requester_shift_id : request.target_shift_id;
                            const shiftDetail = shiftDetails[shiftId];
                            if (shiftDetail?.availableShift) {
                              return (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Date: {shiftDetail.availableShift.shift_date || 'N/A'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Time: {shiftDetail.availableShift.shift_time_start || 'N/A'} - {shiftDetail.availableShift.shift_time_end || 'N/A'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Department: {shiftDetail.availableShift.department_name || 'N/A'}
                                  </Typography>
                                  {shiftDetail.availableShift.department_address && (
                                    <Typography variant="body2" color="text.secondary">
                                      Address: {shiftDetail.availableShift.department_address}
                                    </Typography>
                                  )}
                                </Box>
                              );
                            }
                            return (
                              <Typography variant="body2" color="text.secondary">
                                Shift details not available
                              </Typography>
                            );
                          })()}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 250 }}>
                          <Typography variant="subtitle2" color="primary" fontWeight={600}>
                            {isRequester ? 'Their Shift' : 'Your Shift'}:
                          </Typography>
                          {(() => {
                            const shiftId = isRequester ? request.target_shift_id : request.requester_shift_id;
                            const shiftDetail = shiftDetails[shiftId];
                            if (shiftDetail?.availableShift) {
                              return (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Date: {shiftDetail.availableShift.shift_date || 'N/A'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Time: {shiftDetail.availableShift.shift_time_start || 'N/A'} - {shiftDetail.availableShift.shift_time_end || 'N/A'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Department: {shiftDetail.availableShift.department_name || 'N/A'}
                                  </Typography>
                                  {shiftDetail.availableShift.department_address && (
                                    <Typography variant="body2" color="text.secondary">
                                      Address: {shiftDetail.availableShift.department_address}
                                    </Typography>
                                  )}
                                </Box>
                              );
                            }
                            return (
                              <Typography variant="body2" color="text.secondary">
                                Shift details not available
                              </Typography>
                            );
                          })()}
                        </Box>
                      </Box>
                      
                      {request.message && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="primary" fontWeight={600}>
                            Message:
                          </Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }} color="text.secondary">
                            {request.message}
                          </Typography>
                        </Box>
                      )}
                      
                      {request.response_message && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="primary" fontWeight={600}>
                            Response:
                          </Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }} color="text.secondary">
                            {request.response_message}
                          </Typography>
                        </Box>
                      )}
                      

                    </Paper>
                  );
                })}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setLogDialogOpen(false)}
              variant="contained"
              color="primary"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Pending Request Info Dialog */}
        <PendingRequestInfoDialog
          open={pendingRequestInfoOpen}
          onClose={() => setPendingRequestInfoOpen(false)}
          request={selectedPendingRequest}
          employeeDetails={pendingRequestEmployeeDetails}
          shiftDetails={shiftDetails}
          isMyRequest={selectedPendingRequest ? myRequests.some(req => req.id === selectedPendingRequest.id) : false}
        />
        
      </Box>
      <Footer />
    </ThemeProvider>
  );
};

export default SwapPage; 