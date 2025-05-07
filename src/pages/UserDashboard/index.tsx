import React, { useState, useEffect } from 'react';
import {Box, Container, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,TextField, MenuItem,
  IconButton, Chip, Alert, Snackbar, CircularProgress, CssBaseline, ThemeProvider} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker, DatePicker } from '@mui/x-date-pickers';
import { format, startOfWeek, addDays, parseISO, isWithinInterval } from 'date-fns';
import { MainTheme } from '../../assets/themes/themes';
import Footer from '../../components/layout/Footer';
import Navbar from '../../components/layout/userNavbar';
import { createRequestedShift, getRequestedShifts, deleteRequestedShiftById } from '../../utils/apis/requestedShiftsApis'; // Import the API functions
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
    goToPreviousWeek, fetchShiftsForWeek, commonButtonStyle
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
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 3,
                mt: 1,
              }}
            >
              <Box
                sx={{
                  px: { xs: 2, sm: 4 },
                  py: { xs: 1, sm: 2 },
                  borderRadius: 2,
                  background: '#1a1a1a', // darker background for contrast
                  boxShadow: '0 8px 32px 0 rgba(0, 194, 140, 0.2)',
                  maxWidth: '900px', // wider container
                  width: '100%',
                }}
              >
                <Typography
                  variant="h4"
                  component="h1"
                  align="center"
                  noWrap // Forces single line
                  sx={{
                    color: '#00c28c', // Match your theme's primary color
                    fontWeight: 900,
                    fontFamily: '"Montserrat", "Roboto", sans-serif',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' }, // Slightly smaller for better fit
                    lineHeight: 1.1,
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      letterSpacing: '0.04em',
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  Shift Management System
                </Typography>
              </Box>
            </Box>

            {/* Wrap everything after the title in a frame */}
            <Box
              sx={{
                border: '2px solid rgba(0, 194, 140, 0.2)',
                borderRadius: '12px',
                padding: '24px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                margin: '24px 0',
              }}
            >
              {/* Filters */}
              <Box sx={{ mb: 3 }}>
                <ShiftFilters filter={filter} setFilter={setFilter} />
              </Box>

              {/* Employee selection and Week navigation in one row */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 3,
                  mb: 3,
                }}
              >
                {/* Employee selection */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2,
                  width: { xs: '100%', md: 'auto' }
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
                    sx={{
                      ...commonButtonStyle, // Spread the common styles
                      width: { xs: '100%', sm: 'auto' },
                    }}
                  >
                    Create Dummy Employee
                  </Button>
                </Box>

                {/* Week navigation */}
                <Box sx={{ 
                  display: 'flex',
                  gap: 2,
                  width: { xs: '100%', md: 'auto' }
                }}>
                  <Button 
                    variant="outlined" 
                    onClick={goToPreviousWeek}
                    fullWidth={false}
                    sx={{
                      ...commonButtonStyle, // Spread the common styles
                      width: { xs: '100%', sm: 'auto' },
                    }}
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
                    sx={{
                      ...commonButtonStyle, // Spread the common styles
                      width: { xs: '100%', sm: 'auto' },
                    }}
                  >
                    Next Week
                  </Button>
                </Box>
              </Box>

              {/* Calendar Grid with increased spacing */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 3,
                  overflowX: 'auto',
                  pb: 2,
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
                      minWidth: 150, // Slightly wider columns
                      p: { xs: 1.5, sm: 2 }, // More padding
                      height: '100%',
                      backgroundColor: '#e8f5e9',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(0,0,0,0.12)',
                      position: 'relative',
                      backgroundImage: `
                        linear-gradient(
                          rgba(255,255,255, 0.2) 1px,
                          transparent 1px
                        )
                      `,
                      backgroundSize: '100% 25px', // Creates paper lines effect
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `
                          radial-gradient(
                            rgba(0,0,0,0.1) 1px,
                            transparent 1px
                          )
                        `,
                        backgroundSize: '4px 4px',
                        opacity: 0.2,
                        pointerEvents: 'none',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: '70px',
                        height: '2px',
                        background: 'rgba(0,0,0,0.1)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      }
                    }}
                  >
                    <Box
                      sx={{
                        mb: 2,
                        pb: 1,
                        borderBottom: '1px solid rgba(0,0,0,0.1)',
                        background: 'linear-gradient(180deg, #e8f5e9 0%, #c8e6c9 100%)',
                        borderRadius: '4px 4px 0 0',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <Typography 
                        variant="subtitle1" 
                        fontWeight="bold" 
                        align="center" 
                        gutterBottom
                        sx={{ 
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          color: 'rgba(0,0,0,0.87)',
                        }}
                      >
                        {format(day, 'EEE')}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        align="center" 
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          color: 'rgba(0,0,0,0.6)',
                        }}
                      >
                        {format(day, 'MMM d')}
                      </Typography>
                    </Box>

                    {/* Shifts container */}
                    <Box
                      sx={{
                        mt: 2,
                        maxHeight: 'calc(100% - 90px)', // Account for header height
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          backgroundColor: 'rgba(0,0,0,0.05)',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          borderRadius: '3px',
                        },
                      }}
                    >
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
                                      ...commonButtonStyle,
                                      fontSize: '0.75rem',
                                      padding: '2px 8px',
                                      minWidth: 0,
                                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                      '&:hover': {
                                        ...commonButtonStyle['&:hover'],
                                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                      },
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
                                      ...commonButtonStyle,
                                      fontSize: '0.75rem',
                                      padding: '2px 8px',
                                      minWidth: 0,
                                      backgroundColor: 'rgba(255, 0, 0, 0.5)',
                                      '&:hover': {
                                        ...commonButtonStyle['&:hover'],
                                        backgroundColor: 'rgba(255, 0, 0, 0.7)',
                                      },
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
            <>
              <Alert severity="success" onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            </>
          </Snackbar>
        </Container>
      </Box>
      <Footer /> {/* Add Footer at the bottom */}
    </ThemeProvider>
  );
};

export default UserDashboard;