import React, { useState, useEffect } from 'react';
import {Box, Container, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,TextField, MenuItem,
  IconButton, Chip, Alert, Snackbar, CircularProgress, CssBaseline, ThemeProvider} from '@mui/material';
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
import ActionButtons from '../../components/sections/UserPage/ActionButtons';
import UserDashboardTitle from '../../components/sections/UserPage';
import Filter from '../../components/CalendarFeatures/Filter';

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
            request_shift_id: shift.id,
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
      
      // Create new request with pending status
      const newRequestedShift: RequestedShift = {
        id: response.id,
        request_shift_id: response.id,
        employeeId: currentEmployee.id,
        availableShiftId: shift.id,
        notes: '',
        status: 'pending'
      };

      // Update local state immediately and ensure it persists
      setRequestedShifts(prev => {
        const existingIndex = prev.findIndex(
          req => req.availableShiftId === shift.id
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newRequestedShift;
          return updated;
        }
        return [...prev, newRequestedShift];
      });

      setSuccess('Shift requested successfully');
    } catch (err) {
      setError('Failed to request shift. Please try again.');
    } finally {
      setRequestingShifts(prev => prev.filter(id => id !== shift.id));
    }
  };

  const handleCancelRequest = async (requestId: number, availableShiftId: number) => {
    setCancelingShifts(prev => [...prev, requestId]);
    try {
      await deleteRequestedShiftById(requestId);
      // Remove the cancelled request from local state
      setRequestedShifts(prev => prev.filter(req => req.id !== requestId));
      setSuccess('Request cancelled successfully');
      // Update the shift status to "available"
      setAvailableShifts(prev =>
        prev.map(shift =>
          shift.id === availableShiftId ? { ...shift, status: 'available' } : shift
        )
      );
    } catch (err) {
      setError('Failed to cancel request. Please try again.');
    } finally {
      setCancelingShifts(prev => prev.filter(id => id !== requestId));
    }
  };

  // Modify the polling effect to preserve pending status
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await getRequestedShifts({ request_employee_id: currentEmployee.id });
        if (response?.data) {
          setRequestedShifts(prevRequests => {
            const newRequests = response.data.map(shift => ({
              id: shift.id,
              request_shift_id: shift.id,
              employeeId: shift.employeeId,
              availableShiftId: shift.availableShiftId,
              notes: shift.notes || '',
              status: shift.status || 'pending'
            }));

            // Merge new requests with existing ones, preserving pending status
            const mergedRequests = [...prevRequests];
            newRequests.forEach(newReq => {
              const existingIndex = mergedRequests.findIndex(existing => 
                existing.availableShiftId === newReq.availableShiftId
              );
              if (existingIndex === -1) {
                mergedRequests.push(newReq);
              } else if (mergedRequests[existingIndex].status !== 'pending') {
                mergedRequests[existingIndex] = newReq;
              }
            });
            return mergedRequests;
          });
        }
      } catch (error) {
        console.error('Error polling shifts:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [currentEmployee.id]);

  // Utility function to get shift status for display
  const getShiftStatus = (availableShiftId: number): string => {
    const requestedShift = requestedShifts.find(s => s.availableShiftId === availableShiftId);
    if (requestedShift) {
      return requestedShift.status;
    }
    
    const isAssigned = assignedShifts.some(s => s.availableShiftId === availableShiftId);
    if (isAssigned) {
      return 'assigned';
    }
    
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
            {/* Title Box */}
            <UserDashboardTitle/>
       
            {/* Filters - Pass filter and setFilter props */}
            <Filter filter={filter} setFilter={setFilter} />
   
            {/* Frame Box */}
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
                  minHeight: '600px', // Set minimum height for the container
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
                      flex: '1 1 0', // This ensures equal width columns
                      minWidth: 150,
                      maxWidth: 'calc(100% / 7)', // Ensures columns don't grow too wide
                      height: '600px', // Fixed height for all columns
                      display: 'flex',
                      flexDirection: 'column',
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
                        flexShrink: 0, // Prevents header from shrinking
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
                        flex: 1, // Takes remaining space
                        overflowY: 'auto',
                        p: 1,
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
                          const backgroundColor = status === 'pending' ? '#ff9800' : getShiftColor(status);
                          
                          return (
                            <Box
                              key={shift.id}
                              sx={{
                                mb: 1,
                                p: 1,
                                borderRadius: 1,
                                backgroundColor, // Use the determined color
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
                              <ActionButtons
                                shift={shift}
                                status={status}
                                requesting={requestingShifts.includes(shift.id)}
                                canceling={cancelingShifts.includes(
                                  requestedShifts.find(req => req.availableShiftId === shift.id)?.id || -1
                                )}
                                requestedShifts={requestedShifts}
                                onRequestShift={handleRequestShift}
                                handleDeleteRequestedShift={(requestId) => handleCancelRequest(requestId, shift.id)}
                                buttonStyle={commonButtonStyle}
                              />
                              
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

          {/* Snackbars for notifications */}
          <Box sx={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 2000 }}>
            {error && (
              <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                ClickAwayListenerProps={{ mouseEvent: false, touchEvent: false }}
              >
                <Alert 
                  elevation={6} 
                  variant="filled" 
                  severity="error" 
                  onClose={() => setError(null)}
                  sx={{ width: '100%' }}
                >
                  {error}
                </Alert>
              </Snackbar>
            )}
            
            {success && (
              <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                ClickAwayListenerProps={{ mouseEvent: false, touchEvent: false }}
              >
                <Alert 
                  elevation={6} 
                  variant="filled" 
                  severity="success" 
                  onClose={() => setSuccess(null)}
                  sx={{ width: '100%' }}
                >
                  {success}
                </Alert>
              </Snackbar>
            )}
          </Box>
        </Container>
      </Box>
      <Footer /> {/* Add Footer at the bottom */}
    </ThemeProvider>
  );
};

export default UserDashboard;