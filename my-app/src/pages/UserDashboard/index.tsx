import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  CssBaseline,
  ThemeProvider,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker, DatePicker } from '@mui/x-date-pickers';
import { format, startOfWeek, addDays, parseISO, isWithinInterval } from 'date-fns';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { MainTheme } from '../../assets/themes/themes';
import LogoOnly from '../../components/common/Logo';
import { useNavigate } from 'react-router-dom';

//Types
import {AvailableShift, RequestedShift, AssignedShift} from '../../components/CalendarFeatures/ShiftUtils';
import {Employee} from '../../components/CalendarFeatures/calendarStates';
//import {employees} from '../../components/CalendarFeatures/calendarStates';


// Mock employees data - in a real application this would come from an API
const employees: Employee[] = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Bob Johnson' },
];

const UserDashboad: React.FC = () => {
  const navigate = useNavigate();

  // State for the current week
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  // State for shifts
  const [availableShifts, setAvailableShifts] = useState<AvailableShift[]>([]);
  const [requestedShifts, setRequestedShifts] = useState<RequestedShift[]>([]);
  const [assignedShifts, setAssignedShifts] = useState<AssignedShift[]>([]);
  
  // Current user (would normally come from auth context)
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(employees[0]);
  
  // UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog states
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState<boolean>(false);
  const [isRequestShiftDialogOpen, setIsRequestShiftDialogOpen] = useState<boolean>(false);
  const [selectedShift, setSelectedShift] = useState<AvailableShift | null>(null);
  
  // Form states
  const [newShift, setNewShift] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    start: '09:00:00',
    end: '17:00:00',
  });
  
  const [newRequest, setNewRequest] = useState({
    employeeId: currentEmployee.id,
    availableShiftId: 0,
    notes: '',
  });

  const [filter, setFilter] = useState<'all' | 'requested' | 'accepted'>('all'); // Filter state

  // Generate week days for the schedule
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Fetch shifts for the current week
  useEffect(() => {
    fetchShiftsForWeek();
  }, [currentWeekStart]);

  const fetchShiftsForWeek = async () => {
    setLoading(true);
    try {
      // In a real app, these would be actual API calls
      // For now, we'll simulate API responses
      
      // Fetch available shifts
      const startDate = format(currentWeekStart, 'yyyy-MM-dd');
      const endDate = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
      
      // Simulated API response
      const availableShiftsResponse = [
        { id: 1, date: '2023-10-02', start: '09:00:00', end: '13:00:00' },
        { id: 2, date: '2023-10-02', start: '13:00:00', end: '17:00:00' },
        { id: 3, date: '2023-10-03', start: '09:00:00', end: '17:00:00' },
        { id: 4, date: '2023-10-04', start: '10:00:00', end: '14:00:00' },
        { id: 5, date: '2023-10-05', start: '12:00:00', end: '16:00:00' },
      ];
      
      const requestedShiftsResponse = [
        { id: 1, employeeId: 1, availableShiftId: 1, notes: 'I can work this shift', status: 'pending' },
        { id: 2, employeeId: 2, availableShiftId: 2, notes: 'Available for this shift', status: 'approved' },
        { id: 3, employeeId: 3, availableShiftId: 3, notes: 'Can I take this shift?', status: 'denied' },
      ];
      
      const assignedShiftsResponse = [
        { id: 1, employeeId: 2, availableShiftId: 2 },
        { id: 2, employeeId: 1, availableShiftId: 5 },
      ];
      
      setAvailableShifts(availableShiftsResponse);
      setRequestedShifts(
        requestedShiftsResponse.map(shift => ({
          ...shift,
          status: shift.status as 'pending' | 'approved' | 'denied',
        }))
      );
      setAssignedShifts(assignedShiftsResponse);
    } catch (err) {
      setError('Failed to fetch shifts. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle prev/next week navigation
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prevWeek => addDays(prevWeek, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prevWeek => addDays(prevWeek, 7));
  };

  // Handle adding a new shift
  const handleAddShift = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      console.log('Adding new shift:', newShift);
      
      // Simulate API response
      const newShiftResponse = {
        id: Math.floor(Math.random() * 1000),
        ...newShift
      };
      
      setAvailableShifts(prev => [...prev, newShiftResponse]);
      setSuccess('Shift added successfully');
      setIsAddShiftDialogOpen(false);
    } catch (err) {
      setError('Failed to add shift. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle requesting a shift
  const handleRequestShift = async () => {
    if (!selectedShift) return;
    
    setLoading(true);
    try {
      // In a real app, this would be an API call
      console.log('Requesting shift:', newRequest);
      
      // Simulate API response
      const newRequestResponse = {
        id: Math.floor(Math.random() * 1000),
        ...newRequest,
        availableShiftId: selectedShift.id,
        status: 'pending'
      };
      
      setRequestedShifts(prev => [
        ...prev,
        { ...newRequestResponse, status: newRequestResponse.status as 'pending' | 'approved' | 'denied' }
      ]);
      setSuccess('Shift requested successfully');
      setIsRequestShiftDialogOpen(false);
    } catch (err) {
      setError('Failed to request shift. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a shift
  const handleDeleteShift = async (shiftId: number) => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      console.log('Deleting shift:', shiftId);
      
      setAvailableShifts(prev => prev.filter(shift => shift.id !== shiftId));
      setSuccess('Shift deleted successfully');
    } catch (err) {
      setError('Failed to delete shift. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle accepting a shift
  const handleAcceptShift = async (requestedShiftId: number) => {
    setLoading(true);
    try {
      // Simulate API call to accept the shift
      console.log('Accepting shift:', requestedShiftId);

      setRequestedShifts(prev =>
        prev.map(shift =>
          shift.id === requestedShiftId ? { ...shift, status: 'approved' } : shift
        )
      );
      setSuccess('Shift accepted successfully');
    } catch (err) {
      setError('Failed to accept shift. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Utility function to get shift status for display
  const getShiftStatus = (availableShiftId: number): string => {
    const isAssigned = assignedShifts.some(s => s.availableShiftId === availableShiftId);
    if (isAssigned) return 'assigned';
    
    const requestedShift = requestedShifts.find(s => s.availableShiftId === availableShiftId);
    if (requestedShift) return requestedShift.status;
    
    return 'available';
  };

  // Utility function to get shift color based on status
  const getShiftColor = (status: string): string => {
    switch (status) {
      case 'assigned': return '#4caf50';  // green
      case 'approved': return '#4caf50';  // green
      case 'pending': return '#ff9800';   // orange
      case 'denied': return '#f44336';    // red
      default: return '#2196f3';          // blue for available
    }
  };

  // Utility function to get assigned employee name
  const getAssignedEmployeeName = (availableShiftId: number): string => {
    const assignedShift = assignedShifts.find(s => s.availableShiftId === availableShiftId);
    if (!assignedShift) return '';
    
    const employee = employees.find(e => e.id === assignedShift.employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };

  // Filtered shifts based on the selected filter
  const getFilteredShifts = () => {
    switch (filter) {
      case 'requested':
        return availableShifts.filter(shift =>
          requestedShifts.some(req => req.availableShiftId === shift.id)
        );
      case 'accepted':
        return availableShifts.filter(shift =>
          assignedShifts.some(assign => assign.availableShiftId === shift.id)
        );
      default:
        return availableShifts; // All shifts
    }
  };

  const filteredShifts = getFilteredShifts();

  return (
    <ThemeProvider theme={MainTheme}>
      <CssBaseline />
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          {/* Home Button */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Home
            </Button>
          </Box>
          {/* Fillit Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <LogoOnly />
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Shift Management System
            </Typography>

            {/* Filters */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant={filter === 'all' ? 'contained' : 'outlined'}
                onClick={() => setFilter('all')}
              >
                All Shifts
              </Button>
              <Button
                variant={filter === 'requested' ? 'contained' : 'outlined'}
                onClick={() => setFilter('requested')}
              >
                Requested Shifts
              </Button>
              <Button
                variant={filter === 'accepted' ? 'contained' : 'outlined'}
                onClick={() => setFilter('accepted')}
              >
                Accepted Shifts
              </Button>
            </Box>

            {/* Employee selection */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <TextField
                select
                label="Current Employee"
                value={currentEmployee.id}
                onChange={(e) => {
                  const empId = Number(e.target.value);
                  const employee = employees.find(emp => emp.id === empId);
                  if (employee) setCurrentEmployee(employee);
                }}
                sx={{ width: 200 }}
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Week navigation */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="outlined" onClick={goToPreviousWeek}>
                Previous Week
              </Button>
              <Typography variant="h6">
                {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
              </Typography>
              <Button variant="outlined" onClick={goToNextWeek}>
                Next Week
              </Button>
            </Box>

            {/* Add new shift button */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsAddShiftDialogOpen(true)}
              >
                Add Available Shift
              </Button>
            </Box>

            {/* Weekly schedule grid */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'nowrap', // Prevent wrapping to the next row
                justifyContent: 'space-between', // Ensure even spacing between days
                gap: 2, // Add spacing between days
              }}
            >
              {weekDays.map((day, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: '1 1 calc(14.28% - 16px)', // Ensure all 7 days fit in one row
                    minWidth: 150,
                    p: 2,
                    height: '100%',
                    minHeight: 400,
                    backgroundColor: format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? '#f5f5f5' : 'white',
                    borderRadius: 1,
                    boxShadow: 3,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" align="center" gutterBottom>
                    {format(day, 'EEE')}
                  </Typography>
                  <Typography variant="body2" align="center" gutterBottom sx={{ mb: 2 }}>
                    {format(day, 'MMM d')}
                  </Typography>
                  
                  {/* Shifts for this day */}
                  {filteredShifts
                    .filter(shift => shift.date === format(day, 'yyyy-MM-dd'))
                    .map(shift => {
                      const status = getShiftStatus(shift.id);
                      const backgroundColor = getShiftColor(status);
                      
                      return (
                        <Box
                          key={shift.id}
                          sx={{
                            mb: 1,
                            p: 1,
                            borderRadius: 1,
                            backgroundColor,
                            color: 'white',
                            position: 'relative',
                          }}
                        >
                          <Typography variant="body2">
                            {shift.start.substring(0, 5)} - {shift.end.substring(0, 5)}
                          </Typography>
                          
                          {status === 'assigned' && (
                            <Typography variant="caption" display="block">
                              {getAssignedEmployeeName(shift.id)}
                            </Typography>
                          )}
                          
                          {status === 'available' && (
                            <IconButton
                              size="small"
                              sx={{ position: 'absolute', top: 2, right: 2, color: 'white' }}
                              onClick={() => {
                                setSelectedShift(shift);
                                setNewRequest({
                                  ...newRequest,
                                  availableShiftId: shift.id
                                });
                                setIsRequestShiftDialogOpen(true);
                              }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          )}
                          
                          {status === 'pending' && (
                            <>
                              <Chip
                                label="Pending"
                                size="small"
                                sx={{ fontSize: '0.6rem', height: 16, mt: 0.5 }}
                              />
                              {currentEmployee.id === 1 && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  sx={{ mt: 1 }}
                                  onClick={() => handleAcceptShift(requestedShifts.find(req => req.availableShiftId === shift.id)?.id!)}
                                >
                                  Accept
                                </Button>
                              )}
                            </>
                          )}
                          
                          {status === 'denied' && (
                            <Chip
                              label="Denied"
                              size="small"
                              sx={{ fontSize: '0.6rem', height: 16, mt: 0.5, backgroundColor: '#d32f2f' }}
                            />
                          )}
                          
                          {/* Admin controls */}
                          {currentEmployee.id === 1 && (
                            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                              <IconButton
                                size="small"
                                sx={{ color: 'white', p: 0.3 }}
                                onClick={() => handleDeleteShift(shift.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Add Shift Dialog */}
          <Dialog open={isAddShiftDialogOpen} onClose={() => setIsAddShiftDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Add Available Shift</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date"
                    value={parseISO(newShift.date)}
                    onChange={(newDate) => {
                      if (newDate) {
                        setNewShift(prev => ({
                          ...prev,
                          date: format(newDate, 'yyyy-MM-dd')
                        }));
                      }
                    }}
                    sx={{ width: '100%', mb: 2 }}
                  />
                </LocalizationProvider>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        label="Start Time"
                        value={parseISO(`2023-01-01T${newShift.start}`)}
                        onChange={(newTime) => {
                          if (newTime) {
                            setNewShift(prev => ({
                              ...prev,
                              start: format(newTime, 'HH:mm:ss')
                            }));
                          }
                        }}
                        sx={{ width: '100%' }}
                      />
                    </LocalizationProvider>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        label="End Time"
                        value={parseISO(`2023-01-01T${newShift.end}`)}
                        onChange={(newTime) => {
                          if (newTime) {
                            setNewShift(prev => ({
                              ...prev,
                              end: format(newTime, 'HH:mm:ss')
                            }));
                          }
                        }}
                        sx={{ width: '100%' }}
                      />
                    </LocalizationProvider>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsAddShiftDialogOpen(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleAddShift}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Add Shift"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Request Shift Dialog */}
          <Dialog open={isRequestShiftDialogOpen} onClose={() => setIsRequestShiftDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Request Shift</DialogTitle>
            <DialogContent>
              {selectedShift && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">
                    Date: {selectedShift.date}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Time: {selectedShift.start.substring(0, 5)} - {selectedShift.end.substring(0, 5)}
                  </Typography>
                  <TextField
                    label="Notes"
                    multiline
                    rows={4}
                    value={newRequest.notes}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, notes: e.target.value }))}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsRequestShiftDialogOpen(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleRequestShift}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Request Shift"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbars for notifications */}
          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={() => setError(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Snackbar>
          
          <Snackbar
            open={!!success}
            autoHideDuration={6000}
            onClose={() => setSuccess(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default UserDashboad;