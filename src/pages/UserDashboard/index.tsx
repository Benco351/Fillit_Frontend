import React, { useState, useEffect } from 'react';
import {Box, Container, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,TextField, MenuItem,
  IconButton, Chip, Alert, Snackbar, CircularProgress, CssBaseline, ThemeProvider} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker, DatePicker } from '@mui/x-date-pickers';
import { format, startOfWeek, addDays, parseISO, isWithinInterval } from 'date-fns';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Menu as MenuIcon } from '@mui/icons-material';
import { MainTheme } from '../../assets/themes/themes';
import Footer from '../../components/layout/Footer';
import Navbar from '../../components/layout/userNavbar';
import { intervalToDuration, formatDuration } from 'date-fns';
import {getAvailableShiftById, deleteAvailableShiftById, updateAvailableShiftById, getAvailableShifts } from '../../utils/apis/availableShiftApis'; // Adjust the import path as necessary
import { createRequestedShift, getRequestedShifts, deleteRequestedShiftById } from '../../utils/apis/requestedShiftsApis'; // Import the API functions
import { AvailableShiftQuerySchema, RequestedShiftQueryDTO } from '../../utils/apis/types'; // Import the schema for validation
//Types
import {AvailableShift, RequestedShift, AssignedShift} from '../../components/CalendarFeatures/ShiftUtils';
import {Employee, availableShiftsResponse, requestedShiftsResponse, assignedShiftsResponse, getShiftColor, calculateDuration} from '../../components/CalendarFeatures/calendarStates';
import {employees} from '../../components/CalendarFeatures/calendarStates';

import { createEmployee } from '../../utils/apis/employeeShiftApis'; 
import { useUserDashboard } from '../../hooks/useUserDashboard';
import ShiftFilters from '../../components/ShiftManagment/ShiftFilters';
import RequestShiftDialog from '../../components/ShiftManagment';
//import EditShiftDialog from '../../components/ShiftManagment/editShift';
import WeekPicker from '../../components/CalendarFeatures/WeekPicker';

const UserDashboard: React.FC = () => {

    // Current user 
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(employees[0]);

  //These guys are in useUserDashboard
  const {currentWeekStart, setCurrentWeekStart, availableShifts, setAvailableShifts, requestedShifts, loading, setLoading,
    error, success, filter, setFilter, refreshAvailableShifts, refreshRequestedShifts, setSuccess, 
    setError, setRequestedShifts, assignedShifts, setAssignedShifts, newShift, setNewShift,
    isRequestShiftDialogOpen, setIsRequestShiftDialogOpen, isEditShiftDialogOpen, setIsEditShiftDialogOpen, selectedShift, setSelectedShift, newRequest, setNewRequest, shiftIdToFetch, setShiftIdToFetch,
    fetchedShift, setFetchedShift, weekDays, loadingAvailable, loadingRequested, setLoadingAvailable, setLoadingRequested, goToNextWeek,
    goToPreviousWeek, fetchShiftsForWeek
  } = useUserDashboard(currentEmployee);

  const [editLoading, setEditLoading] = useState(false); // Separate loading state for editing
  const [requestLoading, setRequestLoading] = useState(false); // Separate loading state for requesting
  const [requestingShifts, setRequestingShifts] = useState<number[]>([]); // Separate loading state for each shift request
  const [cancelingShifts, setCancelingShifts] = useState<number[]>([]); // Separate loading state for each shift cancellation

  // Automatically fetch shifts when the component mounts or the week changes
  useEffect(() => {
    fetchShiftsForWeek();
  }, [currentWeekStart]);

  // Fetch requested shifts on component mount
  useEffect(() => {
    const fetchRequestedShifts = async () => {
      setLoading(true);
      try {
        const params = { request_employee_id: currentEmployee.id }; // Ensure this matches the expected structure of GetRequestedShiftsParams
        console.log('Fetching requested shifts with params:', params); // Log the parameters
  
        const response = await getRequestedShifts(params);
  
        console.log('Fetched requested shifts:', response); // Log the response
  
        if (response?.data && Array.isArray(response.data)) {
          const mappedRequestedShifts = response.data.map((shift: any) => ({
            id: shift.request_id || shift.id,
            employeeId: shift.employee_id,
            availableShiftId: shift.shift_slot_id,
            notes: shift.notes || '',
            status: shift.status || 'pending', // Ensure status is 'pending' if not provided
          }));
  
          setRequestedShifts(mappedRequestedShifts); // Update the state with fetched shifts
        }
      } catch (err) {
        if (err instanceof Error && (err as any).response) {
          console.error('Error response from API:', (err as any).response);
        } else {
          console.error('Error fetching requested shifts:', err);
        }
        setError('Failed to fetch requested shifts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    // Call fetch function
    fetchRequestedShifts();
  }, [currentEmployee.id]); // This will trigger on employee ID change or on refresh
  

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleRequestShift = async (shift: AvailableShift) => {
    setRequestingShifts(prev => [...prev, shift.id]);
    try {
      const payload = {
        employeeId: currentEmployee.id,
        shiftSlotId: shift.id,
        notes: '',
      };
  
      const response = await createRequestedShift(payload);
      
      // Use response.id instead of response.data.id
      const newRequest = {
        id: response.id,
        employeeId: currentEmployee.id,
        availableShiftId: shift.id,
        notes: '',
        status: 'pending' as const
      };
  
      setRequestedShifts(prev => [...prev, newRequest]);
      setSuccess('Shift requested successfully');
    } catch (err) {
      setError('Failed to request shift. Please try again.');
    } finally {
      setRequestingShifts(prev => prev.filter(id => id !== shift.id));
    }
  };

const handleDeleteRequestedShift = async (requestId: number) => {
  if (!requestId) return;
  setCancelingShifts(prev => [...prev, requestId]);
  try {
    await deleteRequestedShiftById(requestId);
    setRequestedShifts(prev => prev.filter(req => req.id !== requestId));
    setSuccess('Request cancelled successfully');
  } catch (err) {
    setError('Failed to cancel request. Please try again.');
  } finally {
    setCancelingShifts(prev => prev.filter(id => id !== requestId));
  }
};

  const handleOpenRequestDialog = (shift: AvailableShift) => {
    setSelectedShift(shift);
    setIsRequestShiftDialogOpen(true);
  };


  // Utility function to get shift status for display
  const getShiftStatus = (availableShiftId: number): string => {
    const requestedShift = requestedShifts.find(s => s.availableShiftId === availableShiftId);
    if (requestedShift) return requestedShift.status;
    
    const isAssigned = assignedShifts.some(s => s.availableShiftId === availableShiftId);
    if (isAssigned) return 'assigned';
    
    return 'available';
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
          backgroundColor: 'secondary.main',
          minHeight: '100vh',
          py: 4,
          px: 2, // Add padding for better spacing
        }}
      >
        <Container
          maxWidth={false} // Remove maxWidth restriction
          sx={{ 
            px: { xs: 1, sm: 2, md: 3 }, // Reduce padding to maximize width
            width: '100%',
            maxWidth: '100%' 
          }}
        >
          <Navbar />

          <Box sx={{ my: 3 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{
                color: '#00c28c',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                fontFamily: 'Roboto, sans-serif',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, // Responsive font size
              }}
            >
              Shift Management System
            </Typography>

            {/* Filters */}
            <Box sx={{ 
              mb: 2, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'center', 
              gap: 2,
              alignItems: { xs: 'stretch', sm: 'center' }
            }}>
              <ShiftFilters filter={filter} setFilter={setFilter} />
            </Box>

            {/* Employee selection */}
            <Box sx={{ 
              mb: 2, 
              display: 'flex', 
              justifyContent: { xs: 'center', sm: 'flex-end' },
              alignItems: 'center', // Align items vertically
              gap: 2, // Add spacing between dropdown and button
              width: '100%'
            }}>
              <TextField
                select
                label="Current Employee"
                value={currentEmployee.id}
                onChange={(e) => {
                  const empId = Number(e.target.value);
                  const employee = employees.find(emp => emp.id === empId);
                  if (employee) setCurrentEmployee(employee);
                }}
                sx={{ 
                  width: { xs: '100%', sm: 200 },
                  color: 'white',
                  '& .MuiInputBase-input': { color: 'white' }
                }}
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="contained"
                color="secondary"
                onClick={async () => {
                  try {
                    const response = await createEmployee({
                      name: 'John Doe',
                      email: `john${Math.floor(Math.random() * 10000)}@example.com`,
                      password: 'SuperSecret123!',
                      phone: '1234567890'
                    });
                    console.log('Employee created successfully:', response);
                    alert('Employee created successfully!');
                  } catch (error) {
                    console.error('Failed to create employee:', error);
                    alert('Failed to create employee. Check console for details.');
                  }
                }}
                fullWidth={false}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Create Dummy Employee
              </Button>
            </Box>

            {/* Week navigation */}
            <Box sx={{ 
              mb: 2, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: 'center',
              gap: 2
            }}>
              <Button 
                variant="outlined" 
                onClick={goToPreviousWeek}
                fullWidth={false}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Previous Week
              </Button>
              <WeekPicker
                currentWeekStart={currentWeekStart}
                onWeekChange={setCurrentWeekStart}
              />
              <Button 
                variant="outlined" 
                onClick={goToNextWeek}
                fullWidth={false}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Next Week
              </Button>
            </Box>

            {/* Add new shift button */}
            <Box sx={{ 
              mb: 2, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'flex-end',
              gap: 2
            }}>
          
              
              {/* Weekly schedule grid */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  flexWrap: 'nowrap',
                  justifyContent: 'space-between',
                  gap: 1, // Reduce gap to fit more content
                  overflowX: 'auto',
                  width: '100%', // Ensure full width
                  height: 'calc(100vh - 300px)',
                  '&::-webkit-scrollbar': {
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '4px',
                  },
                }}
              >
                {weekDays.map((day, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: 1,
                      minWidth: 120, // Reduce minimum width to fit more columns
                      p: { xs: 1, sm: 1.5 }, // Reduce padding
                      height: '100%',
                      backgroundColor: 'white',
                      borderRadius: 1,
                      boxShadow: 3,
                    }}
                  >
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="bold" 
                      align="center" 
                      gutterBottom
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      {format(day, 'EEE')}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      align="center" 
                      gutterBottom 
                      sx={{ 
                        mb: 2,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
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
                            <Typography 
                              variant="body2"
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                              {shift.start.substring(0, 5)} - {shift.end.substring(0, 5)}
                            </Typography>
                            
                            {status === 'assigned' && (
                              <Typography 
                                variant="caption" 
                                display="block"
                                sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                              >
                                {getAssignedEmployeeName(shift.id)}
                              </Typography>
                            )}
                            
                            {/* Action Buttons */}
                            <Box sx={{ 
                              mt: 1,
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: 1
                            }}>
                              {status === 'available' && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => handleRequestShift(shift)}
                                  disabled={requestingShifts.includes(shift.id)}
                                  sx={{ 
                                    fontSize: '0.75rem',
                                    padding: '2px 8px',
                                    minWidth: 0,
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    }
                                  }}
                                >
                                  {requestingShifts.includes(shift.id) ? 'Requesting...' : 'Request'}
                                </Button>
                              )}
                              {status === 'pending' && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="error"
                                  onClick={() => {
                                    const request = requestedShifts.find(req => req.availableShiftId === shift.id);
                                    if (request && request.id) {
                                      handleDeleteRequestedShift(request.id);
                                    }
                                  }}
                                  disabled={cancelingShifts.includes(
                                    requestedShifts.find(req => req.availableShiftId === shift.id)?.id || -1
                                  )}
                                  sx={{ 
                                    fontSize: '0.75rem',
                                    padding: '2px 8px',
                                    minWidth: 0,
                                    backgroundColor: 'rgba(255, 0, 0, 0.5)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 0, 0, 0.7)',
                                    }
                                  }}
                                >
                                  {cancelingShifts.includes(requestedShifts.find(req => req.availableShiftId === shift.id)?.id!) 
                                    ? 'Cancelling...' 
                                    : 'Cancel Request'
                                  }
                                </Button>
                              )}
                            </Box>
                            
                            {status === 'pending' && (
                              <Chip
                                label="Pending"
                                size="small"
                                sx={{ 
                                  fontSize: '0.6rem', 
                                  height: 16,
                                  mt: 0.5
                                }}
                              />
                            )}
                            
                            {status === 'denied' && (
                              <Chip
                                label="Denied"
                                size="small"
                                sx={{ 
                                  fontSize: '0.6rem', 
                                  height: 16, 
                                  backgroundColor: '#d32f2f',
                                  mt: 0.5 
                                }}
                              />
                            )}
                          </Box>
                        );
                      })}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

  
          {/* Request Shift Dialog */}
          <RequestShiftDialog/>

          {/* Snackbars for notifications */}
          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={() => setError(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{
              bottom: { xs: 0, sm: 24 },
              left: { xs: 0, sm: '50%' },
              transform: { xs: 'none', sm: 'translateX(-50%)' }
            }}
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
            sx={{
              bottom: { xs: 0, sm: 24 },
              left: { xs: 0, sm: '50%' },
              transform: { xs: 'none', sm: 'translateX(-50%)' }
            }}
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

export default UserDashboard;