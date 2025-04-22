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
import Navbar from '../../components/layout/dashboardNavbar';
import Footer from '../../components/layout/Footer';
import { intervalToDuration, formatDuration } from 'date-fns';
import { createAvailableShift, getAvailableShiftById } from '../../utils/apis/availableShiftApis'; // Adjust the import path as necessary

//Types
import {AvailableShift, RequestedShift, AssignedShift} from '../../components/CalendarFeatures/ShiftUtils';
import {Employee} from '../../components/CalendarFeatures/calendarStates';
//import {employees} from '../../components/CalendarFeatures/calendarStates';

// Helper function to calculate duration between two time strings (HH:MM:SS format)
const calculateDuration = (startTime: string, endTime: string): string => {
  try {
    // Parse hours, minutes from time strings
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    // Convert to minutes
    let startTotalMinutes = startHours * 60 + startMinutes;
    let endTotalMinutes = endHours * 60 + endMinutes;
    
    // Handle case where end time is on the next day
    if (endTotalMinutes < startTotalMinutes) {
      endTotalMinutes += 24 * 60; // Add a day
    }
    
    // Calculate difference in minutes
    const diffMinutes = endTotalMinutes - startTotalMinutes;
    
    // Convert back to hours and minutes
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    // Format the result
    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes > 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''}` : ''}`;
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 'Unknown duration';
  }
};

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
  
  // UI states/
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

  // State for fetching a shift by ID
  const [shiftIdToFetch, setShiftIdToFetch] = useState<number | ''>('');
  const [fetchedShift, setFetchedShift] = useState<AvailableShift | null>(null);

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
      console.log('Adding new shift:', newShift);
      
      const apiResponse = await createAvailableShift({
        date: new Date(newShift.date),
        start: newShift.start,
        end: newShift.end
      });
  
      // Log the complete response
      console.log('API response:', apiResponse);
      
      // Look for shift_id instead of id
      let shiftId = null;
      
      // Check for shift_id in different possible locations based on your backend response
      if (apiResponse && apiResponse.shift_id !== undefined) {
        shiftId = apiResponse.shift_id;
      } 
      else if (apiResponse && apiResponse.data && apiResponse.data.shift_id !== undefined) {
        shiftId = apiResponse.data.shift_id;
      }
      
      if (shiftId === null) {
        console.error('Could not find shift_id in API response');
        setError('Shift created but ID is missing. Please refresh.');
        return;
      }
  
      const addedShift: AvailableShift = {
        id: shiftId, // Use the extracted shift_id as the id in your frontend
        date: format(new Date(newShift.date), 'yyyy-MM-dd'),
        start: newShift.start,
        end: newShift.end,
      };
  
      setAvailableShifts(prev => {
        const updatedShifts = [...prev, addedShift];
        console.log('Updated availableShifts:', updatedShifts);
        return updatedShifts;
      });
  
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

  const handleGetShiftById = async () => {
    if (!shiftIdToFetch) {
      setError('Please enter a valid shift ID.');
      return;
    }

    setLoading(true);
    try {
      const response = await getAvailableShiftById(Number(shiftIdToFetch));

      // Set the fetched shift details
      setFetchedShift({
        id: response.data.id || response.data.shift_id, // Handle different possible field names
        date: response.data.date || response.data.shift_date,
        start: response.data.start || response.data.shift_start,
        end: response.data.end || response.data.shift_end,
      });

      setSuccess(`Shift with ID ${shiftIdToFetch} fetched successfully.`);
    } catch (err) {
      setError('Failed to fetch shift. Please try again.');
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
      <Navbar /> {/* Add Navbar at the top */}
      <Box
        sx={{
          backgroundColor: '#232a31',
          minHeight: '100vh',
          py: 4,
          px: 2, // Add padding for better spacing
        }}
      >
        <Container
          maxWidth={false} // Remove maxWidth restriction
          sx={{ px: { xs: 2, sm: 4, md: 6 } }} // Add responsive padding
        >
          {/* Home Button
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Home
            </Button>
          </Box> */}
          {/* Fillit Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <LogoOnly />
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{ color: 'white' }} // Set text color to white
            >
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
                sx={{ width: 200, color: 'white', '& .MuiInputBase-input': { color: 'white' } }} // Set text color to white
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
              <Typography variant="h6" sx={{ color: 'white' }}> {/* Set text color to white */}
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

                    
            {/* Get Shift by ID Section */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{ color: 'white', mb: 2 }}
              >
                Get Available Shift by ID
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Shift ID"
                  type="number"
                  value={shiftIdToFetch}
                  onChange={(e) => setShiftIdToFetch(Number(e.target.value) || '')}
                  sx={{ width: 200, backgroundColor: 'white' }}
                />
                <Button
                  variant="contained"
                  onClick={handleGetShiftById}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Fetch Shift'}
                </Button>
              </Box>
              {fetchedShift && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 1 }}>
                  <Typography variant="body1">
                    <strong>ID:</strong> {fetchedShift.id}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Date:</strong> {fetchedShift.date}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Start:</strong> {fetchedShift.start}
                  </Typography>
                  <Typography variant="body1">
                    <strong>End:</strong> {fetchedShift.end}
                  </Typography>
                </Box>
              )}
            </Box>
            {/* Weekly Schedule */} 

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
                    backgroundColor: 'white', // Set all columns to white
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
      <Footer /> {/* Add Footer at the bottom */}
    </ThemeProvider>
  );
};

export default UserDashboad;