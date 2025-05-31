import React, { useState, useEffect, useMemo } from 'react';
import {Box, Container, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,TextField, MenuItem,
  IconButton, Chip, Alert, Snackbar, CircularProgress, CssBaseline, ThemeProvider} from '@mui/material';
import { format} from 'date-fns';
import { MainTheme } from '../../assets/themes/themes';
import Footer from '../../components/layout/Footer';
import Navbar from '../../components/layout/userNavbar';
import { createRequestedShift, deleteRequestedShiftById } from '../../utils/apis/requestedShiftsApis'; // Import the API functions
import {AvailableShift, RequestedShift, AssignedShift} from '../../components/CalendarFeatures/ShiftUtils';
import {Employee, availableShiftsResponse, requestedShiftsResponse, assignedShiftsResponse, getShiftColor, calculateDuration} from '../../components/CalendarFeatures/calendarStates';
import {employees} from '../../components/CalendarFeatures/calendarStates';
import { createEmployee, getEmployees, deleteEmployeeById } from '../../utils/apis/employeeShiftApis'; 
import { useUserDashboard } from '../../hooks/useUserDashboard';
import ShiftFilters from '../../components/ShiftManagment/ShiftFilters';
import RequestShiftDialog from '../../components/ShiftManagment';
//import EditShiftDialog from '../../components/ShiftManagment/editShift';
import WeekPicker from '../../components/CalendarFeatures/WeekPicker';
import ActionButtons from '../../components/sections/UserPage/ActionButtons';
import UserDashboardTitle from '../../components/sections/UserPage';
import Filter from '../../components/CalendarFeatures/Filter';
import AIChatPopup from '../../components/aiChat';
import { getRequestedShifts } from '../../utils/apis/requestedShiftsApis';
import { getAvailableShifts } from '../../utils/apis/availableShiftApis';
import { getAssignedShifts } from '../../utils/apis/assignedShiftApis';
import { deleteAssignedShiftById } from '../../utils/apis/assignedShiftApis';
import { deleteAvailableShiftById } from '../../utils/apis/availableShiftApis';

const UserDashboard: React.FC = () => {

    // Current user 
  // //const [currentEmployee, setCurrentEmployee] = useState<Employee>(employees[0]);
  // const currentEmployee_id = parseInt(sessionStorage.getItem('customEmployeeId'))

  // Parse values from sessionStorage
  const customEmployeeId = Number(sessionStorage.getItem('customEmployeeId'));
  const name = sessionStorage.getItem('name') || '';
  const email = sessionStorage.getItem('email') || '';

// Create Employee object
  const currentEmployee: Employee = {
    id: customEmployeeId,
    name,
    email
  };


  //These guys are in useUserDashboard
  const {currentWeekStart, setCurrentWeekStart, availableShifts, setAvailableShifts, requestedShifts, setLoading,
    error, success, filter, setFilter, setSuccess, 
    setError, setRequestedShifts, assignedShifts, weekDays, goToNextWeek,
    goToPreviousWeek, fetchShiftsForWeek, commonButtonStyle
  } = useUserDashboard(currentEmployee);

  const [requestingShifts, setRequestingShifts] = useState<number[]>([]); // Separate loading state for each shift request
  const [cancelingShifts, setCancelingShifts] = useState<number[]>([]); // Separate loading state for each shift cancellation


  // Automatically fetch shifts when the component mounts or the week changes
  useEffect(() => {
    fetchShiftsForWeek();
  }, [currentWeekStart]);


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

      const newRequestedShift: RequestedShift = {
        id: response.id,
        employeeId: currentEmployee.id,
        availableShiftId: shift.id,
        notes: '',
        status: 'pending'
      };

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

  // Update the getShiftStatus function to ensure users see denied shifts as "denied"
  const getShiftStatus = (availableShiftId: number): string => {
    const requestedShift = requestedShifts.find(s => s.availableShiftId === availableShiftId);

    if (requestedShift) {
      // If the shift is denied, show it as "denied" for users
      if (requestedShift.status === 'denied') {
        return 'denied';
      }
      return requestedShift.status;
    }

    const isAssigned = assignedShifts.some(s => s.assigned_shift_id === availableShiftId);
    return isAssigned ? 'assigned' : 'available';
  };

  // Utility function to get assigned employee name
  const getAssignedEmployeeName = (availableShiftId: number): string => {
    const assignedShift = assignedShifts.find(s => s.assigned_shift_id === availableShiftId);
    if (!assignedShift) return '';
    
    const employee = employees.find(e => e.id === assignedShift.assigned_employee_id);
    return employee ? employee.name : 'Unknown Employee';
  };

  // Filtered shifts based on the selected filter
  const filteredShifts = useMemo(() => {
    // Always start with all available shifts
    if (!availableShifts) return [];
    switch (filter) {
      case 'requested':
        // Show all shifts that have been requested by the user
        return availableShifts.filter(shift =>
          requestedShifts.some(req => req.availableShiftId === shift.id)
        );
      case 'accepted':
        // Show all shifts that have been approved or assigned to the user
        return availableShifts.filter(shift =>
          requestedShifts.some(req =>
            req.availableShiftId === shift.id && req.status === 'approved'
          ) ||
          assignedShifts.some(assign => assign.assigned_shift_id === shift.id)
        );
      default:
        // Always show all available shifts (live)
        return availableShifts;
    }
  }, [availableShifts, requestedShifts, assignedShifts, filter]);

  return (
    <ThemeProvider theme={MainTheme}>
      <AIChatPopup />
      <CssBaseline />
      <Box sx={{ backgroundColor: '#093039', minHeight: '100vh', py: 4, px: 2 }}>
        <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 3 }, width: '100%', maxWidth: '100%' }}>
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
                transform: 'translateZ(0)',
                willChange: 'transform',
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
                {/* Employee selection
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
                </Box> */}

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

              {/* Calendar Grid */}
              <Box
                sx={{
                  display: 'flex', 
                  gap: 2, 
                  overflowX: 'auto',
                  pb: 2,
                  width: '100%',
                  '&::-webkit-scrollbar': {
                    height: '8px',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#093039',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: '#093039',
                    }
                  }
                }}
              >
                {weekDays.map((day, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: 1, 
                      minWidth: 0, 
                      maxWidth: '100%',
                      height: '600px',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '16px',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'linear-gradient(180deg, rgba(0,194,140,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                        pointerEvents: 'none',
                      },
                      transform: 'translateZ(0)',
                      willChange: 'transform',
                    }}
                  >
                    {/* Day Header */}
                    <Box
                      sx={{
                        p: 2,
                        background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.1) 0%, rgba(0, 194, 140, 0.05) 100%)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <Typography
                        variant="h6"
                        align="center"
                        sx={{
                          fontSize: { xs: '1rem', sm: '1.1rem' },
                          fontWeight: 600,
                          color: '#00c28c',
                          mb: 0.5
                        }}
                      >
                        {format(day, 'EEE')}
                      </Typography>
                      <Typography
                        variant="body2"
                        align="center"
                        sx={{
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          color: 'rgba(255, 255, 255, 0.7)'
                        }}
                      >
                        {format(day, 'MMM d')}
                      </Typography>
                    </Box>

                    {/* Shifts Container */}
                    <Box
                      sx={{
                        flex: 1,
                        overflowY: 'auto',
                        p: { xs: 1, sm: 2 },
                        gap: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        '&::-webkit-scrollbar': {
                          width: '4px',
                        },
                        '&::-webkit-scrollbar-track': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: 'rgba(0, 194, 140, 0.2)',
                          borderRadius: '2px',
                        }
                      }}
                    >
                      {filteredShifts
                        .filter(shift => shift.date === format(day, 'yyyy-MM-dd'))
                        .map((shift, idx, arr) => {
                          const status = getShiftStatus(shift.id);
                          const backgroundColor =
                            status === 'denied' ? '#f44336' :
                            status === 'pending' ? '#ff9800' :
                            getShiftColor(status);

                          return (
                            <Box
                              key={shift.id}
                              sx={{
                                width: '100%',
                                pb: idx === arr.length - 1 ? 0 : 2,
                                height: 'auto',
                                minWidth: 0,
                              }}
                            >
                              <Box
                                sx={{
                                  p: { xs: 1.5, sm: 2 },
                                  borderRadius: '12px',
                                  backgroundColor: backgroundColor,
                                  backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                  backdropFilter: 'blur(4px)',
                                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  transition: 'all 0.3s ease, background-color 0.3s ease',
                                  minHeight: 80,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  position: 'relative',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
                                  },
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: { xs: '0.7rem', sm: '0.7rem' },
                                    wordBreak: 'break-word',
                                    mb: 0.5,
                                  }}
                                >
                                  {shift.start.substring(0, 5)} - {shift.end.substring(0, 5)}
                                </Typography>

                                {status === 'approved' && (
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                                  >
                                    Request Approved
                                  </Typography>
                                )}

                                {status === 'assigned' && (
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                                  >
                                    {getAssignedEmployeeName(shift.id)}
                                  </Typography>
                                )}

                                {status === 'denied' && (
                                  <Chip
                                    label="Shift Denied"
                                    size="small"
                                    sx={{
                                      fontSize: { xs: '0.6rem', sm: '0.75rem' },
                                      height: { xs: 18, sm: 20 },
                                      px: 1.2,
                                      backgroundColor: '#d32f2f',
                                      color: 'white',
                                      borderRadius: '8px',
                                      fontWeight: 600,
                                      letterSpacing: '0.5px',
                                      boxShadow: '0 2px 8px rgba(211,47,47,0.12)',
                                      maxWidth: '100%',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      alignSelf: 'flex-start',
                                      mt: 0.5,
                                    }}
                                  />
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
                              </Box>
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