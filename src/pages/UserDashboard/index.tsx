import React, { useState, useEffect, useMemo } from 'react';
import {Box, Container, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,TextField, MenuItem,
  IconButton, Chip, Alert, Snackbar, CircularProgress, CssBaseline, ThemeProvider} from '@mui/material';
import { format} from 'date-fns';
import { MainTheme } from '../../assets/themes/themes';
import Footer from '../../components/layout/Footer';
import AdminNavbar from '../../components/layout/AdminNavbar';
import { createRequestedShift, deleteRequestedShiftById } from '../../utils/apis/requestedShiftsApis'; // Import the API functions
import {AvailableShift, RequestedShift, AssignedShift} from '../../components/CalendarFeatures/ShiftUtils';
import {Employee, getShiftColor, calculateDuration} from '../../components/CalendarFeatures/calendarStates';

import { getEmployees, deleteEmployeeById } from '../../utils/apis/employeeShiftApis'; 
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
import { getDepartments } from '../../utils/apis/departmentApis';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../routes/config/routes';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is admin and redirect to admin dashboard
  useEffect(() => {
    const isAdmin = typeof window !== 'undefined' && sessionStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
      navigate(ROUTES.ADMIN, { replace: true });
    }
  }, [navigate]);

  // Scroll restoration effect
  useEffect(() => {
    // If coming from shift info, scroll to top smoothly
    if (location.state?.fromShiftInfo) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.state]);

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
  // Employees state
  const [employees, setEmployees] = useState<Employee[]>([]);
  // Departments state
  const [departments, setDepartments] = useState<{ id: number; name: string; address?: string }[]>([]);
  // Department filter state
  const [departmentFilter, setDepartmentFilter] = useState<number | 'all'>('all');

  // Info dialog state
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedShiftInfo, setSelectedShiftInfo] = useState<AvailableShift | null>(null);

  // Navigation functions
  const handleNavigateToShiftInfo = (shiftId: number) => {
    navigate(ROUTES.SHIFT_INFO.replace(':shiftId', shiftId.toString()));
  };

  const handleShiftCardClick = (shift: AvailableShift) => {
    setSelectedShiftInfo(shift);
    setInfoDialogOpen(true);
  };


  // Automatically fetch shifts when the component mounts or the week changes
  useEffect(() => {
    fetchShiftsForWeek();
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
    const fetchEmployees = async () => {
      try {
        const employeesResponse = await getEmployees();
        if (employeesResponse?.data && Array.isArray(employeesResponse.data)) {
          setEmployees(employeesResponse.data.map((emp: any) => ({
            id: emp.employee_id ?? emp.id,
            name: emp.employee_name ?? emp.name,
            email: emp.employee_email ?? emp.email,
          })));
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    };
    fetchDepartments();
    fetchEmployees();
  }, [currentWeekStart]);

  // Prevent automatic scroll restoration on component mount
  useEffect(() => {
    // Only scroll to top if explicitly coming from shift info
    if (location.state?.fromShiftInfo) {
      // Clear the state to prevent repeated scrolling
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);


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

  // Update the getShiftStatus function to handle swapped status and slot availability
  const getShiftStatus = (availableShiftId: number): string => {
    const requestedShift = requestedShifts.find(s => s.availableShiftId === availableShiftId);
    const availableShift = availableShifts.find(s => s.id === availableShiftId);

    // Debug logging
    console.log('getShiftStatus for shift:', availableShiftId, {
      availableShift,
      shift_slots_amount: availableShift?.shift_slots_amount,
      shift_slots_taken: availableShift?.shift_slots_taken,
      requestedShift,
      availableShiftsLength: availableShifts.length,
      requestedShiftsLength: requestedShifts.length,
      assignedShiftsLength: assignedShifts.length,
      currentEmployeeId: currentEmployee.id
    });

    // FIRST: Check if current user is assigned to this shift (regardless of slots)
    const isUserAssigned = assignedShifts.some(s => 
      s.assigned_shift_id === availableShiftId && 
      s.assigned_employee_id === currentEmployee.id
    );
    
    if (isUserAssigned) {
      console.log('User is assigned to this shift, returning assigned status');
      return 'assigned';
    }

    // SECOND: Check if user has a requested shift for this shift
    if (requestedShift) {
      // If the shift is denied, show it as "denied" for users
      if (requestedShift.status === 'denied') {
        return 'denied';
      }
      // If the shift is swapped, treat it as available (user can request again)
      if (requestedShift.status === 'swapped') {
        return 'available';
      }
      return requestedShift.status;
    }

    // THIRD: Check if shift has available slots
    if (availableShift) {
      const slotsAmount = Number(availableShift.shift_slots_amount) || 1;
      const slotsTaken = Number(availableShift.shift_slots_taken) || 0;
      const availableSlots = isNaN(slotsAmount) || isNaN(slotsTaken) ? 1 : slotsAmount - slotsTaken;
      
      console.log('Slot check:', {
        shift_slots_amount: slotsAmount,
        shift_slots_taken: slotsTaken,
        availableSlots,
        hasAvailableSlots: availableSlots > 0,
        type_slots_amount: typeof availableShift.shift_slots_amount,
        type_slots_taken: typeof availableShift.shift_slots_taken,
        raw_slots_amount: availableShift.shift_slots_amount,
        raw_slots_taken: availableShift.shift_slots_taken,
        isNaN_slots_amount: isNaN(slotsAmount),
        isNaN_slots_taken: isNaN(slotsTaken),
        isNaN_availableSlots: isNaN(availableSlots)
      });
      
      // If no slots are available, show as full
      if (availableSlots <= 0) {
        console.log('Shift is full, returning full status');
        return 'full';
      }
    }

    return 'available';
  };

  // Utility function to get assigned employee name
  const getAssignedEmployeeName = (availableShiftId: number): string => {
    const assignedShift = assignedShifts.find(s => s.assigned_shift_id === availableShiftId);
    if (!assignedShift) return '';
    
    const employee = employees.find(e => e.id === assignedShift.assigned_employee_id);
    return employee ? employee.name : 'Unknown Employee';
  };

  // Filtered shifts based on the selected filter and department
  const filteredShifts = useMemo(() => {
    let shifts = availableShifts;
    if (departmentFilter !== 'all') {
      shifts = shifts.filter(shift => shift.department_id === departmentFilter);
    }
    
    // Apply filter
    let filteredShifts;
    switch (filter) {
      case 'requested':
        // Show only shifts that are requested by the current user and still pending
        filteredShifts = shifts.filter(shift =>
          requestedShifts.some(req => 
            req.availableShiftId === shift.id && 
            req.employeeId === currentEmployee.id && 
            req.status === 'pending'
          )
        );
        break;
      case 'accepted':
        // Show only shifts that are assigned to the current user
        console.log('🔍 ACCEPTED FILTER DEBUG:');
        console.log('Current employee ID:', currentEmployee.id);
        console.log('Available shifts:', shifts);
        console.log('Assigned shifts:', assignedShifts);
        
        filteredShifts = shifts.filter(shift => {
          const isAssigned = assignedShifts.some(assign => 
            assign.assigned_shift_id === shift.id && 
            assign.assigned_employee_id === currentEmployee.id
          );
          console.log(`Shift ${shift.id} (${shift.date}): isAssigned = ${isAssigned}`);
          return isAssigned;
        });
        
        console.log('🔍 Filtered shifts for accepted:', filteredShifts);
        break;
      default:
        filteredShifts = shifts;
    }
    
    // Sort shifts consistently by date, start time, and ID to prevent position jumping
    return filteredShifts.sort((a, b) => {
      // First sort by date
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      // Then by start time
      if (a.start !== b.start) {
        return a.start.localeCompare(b.start);
      }
      // Finally by ID for complete stability
      return a.id - b.id;
    });
  }, [availableShifts, requestedShifts, assignedShifts, filter, departmentFilter]);

  return (
    <ThemeProvider theme={MainTheme}>
      <AIChatPopup />
      <CssBaseline />
      <Box sx={{ 
        backgroundColor: '#093039', 
        minHeight: '100vh', 
        py: 4, 
        px: 2,
        scrollBehavior: 'smooth',
        overflowAnchor: 'none'
      }}>
        <Container maxWidth={false} sx={{ 
          px: { xs: 1, sm: 2, md: 3 }, 
          width: '100%', 
          maxWidth: '100%',
          scrollBehavior: 'smooth'
        }}>
          <AdminNavbar />

          <Box sx={{ my: 3 }}>
            {/* Title Box */}
            <UserDashboardTitle/>

       
            {/* Filters - Matching User Dashboard position */}
            <Box sx={{
              mb: 4,
              display: 'flex',
              justifyContent: 'center',
              gap: 2, // Add gap between filters
              flexWrap: 'wrap',
              alignItems: 'center',
            }}>
            <Filter filter={filter} setFilter={setFilter} />
            </Box>
            {/* Centered department dropdown below filter row */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <TextField
                select
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                sx={{ minWidth: 200, maxWidth: 320, width: '100%', background: '#fff', borderRadius: 1, color: '#000',
                  '& .MuiInputBase-input, & .MuiSelect-icon': { color: '#000' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#00c28c' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00c28c' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00c28c' }
                }}
                size="small"
              >
                <MenuItem value="all" sx={{ color: '#000', background: '#fff' }}>All Departments</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept.id} value={dept.id} sx={{ color: '#000', background: '#fff' }}>{dept.name}</MenuItem>
                ))}
              </TextField>
            </Box>
   
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

              {/* Add department filter dropdown above the calendar grid */}
              {/* <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <TextField
                  select
                  label="Department Filter"
                  value={departmentFilter}
                  onChange={e => setDepartmentFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                  ))}
                </TextField>
              </Box> */}

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
                          
                          // Debug logging for shift rendering
                          console.log('Rendering shift:', shift.id, {
                            shift,
                            status,
                            shift_slots_amount: shift.shift_slots_amount,
                            shift_slots_taken: shift.shift_slots_taken
                          });
                          
                          const backgroundColor =
                            status === 'denied' ? '#f44336' :
                            status === 'pending' ? '#ff9800' :
                            status === 'full' ? '#757575' :
                            getShiftColor(status);

                          return (
                            <Box
                              key={`${shift.date}-${shift.id}`}
                              sx={{
                                width: '100%',
                                pb: idx === arr.length - 1 ? 0 : 2,
                                minHeight: 110, // Use minHeight instead of fixed height
                                mb: 2, // Add consistent margin between shift cards
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
                                  cursor: 'pointer',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
                                  },
                                }}
                                onClick={() => handleShiftCardClick(shift)}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: { xs: '0.7rem', sm: '0.7rem' },
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {shift.start.substring(0, 5)} - {shift.end.substring(0, 5)}
                                </Typography>
                                  <IconButton
                                    size="small"
                                    sx={{ color: '#fff', ml: 1, p: 0.5, '&:hover': { color: '#fff', background: 'none' }, '&:focus': { color: '#fff' } }}
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent triggering the card click
                                      handleNavigateToShiftInfo(shift.id);
                                    }}
                                  >
                                    <InfoIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                                <Box sx={{ minHeight: 18 }}>
                                  {shift.department_id && (
                                    <Typography variant="caption" sx={{ color: '#111', fontWeight: 500 }}>
                                      {departments.find(d => d.id === shift.department_id)?.name || 'Department'}
                                    </Typography>
                                  )}
                                  {/* Display slot information */}
                                  {shift.shift_slots_amount && (
                                    <Typography variant="caption" sx={{ 
                                      color: '#111', 
                                      fontWeight: 500,
                                      display: 'block',
                                      mt: 0.5,
                                      fontSize: { xs: '0.6rem', sm: '0.7rem' }
                                    }}>
                                      Slots: {shift.shift_slots_taken || 0}/{shift.shift_slots_amount}
                                    </Typography>
                                  )}
                                </Box>

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

                                {status === 'swapped' && (
                                  <Chip
                                    label="Previously Swapped"
                                    size="small"
                                    sx={{
                                      fontSize: { xs: '0.6rem', sm: '0.75rem' },
                                      height: { xs: 18, sm: 20 },
                                      px: 1.2,
                                      backgroundColor: '#9c27b0',
                                      color: 'white',
                                      borderRadius: '8px',
                                      fontWeight: 600,
                                      letterSpacing: '0.5px',
                                      boxShadow: '0 2px 8px rgba(156,39,176,0.12)',
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
      {/* Info Dialog for assigned users */}
      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Shift Information</DialogTitle>
        <DialogContent>
          {selectedShiftInfo && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" gutterBottom>
                Slots: {selectedShiftInfo.shift_slots_taken || 0}/{selectedShiftInfo.shift_slots_amount}
              </Typography>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Assigned Users:
              </Typography>
              {assignedShifts
                .filter(assign => assign.assigned_shift_id === selectedShiftInfo.id)
                .map(assign => {
                  const user = employees.find(emp => emp.id === assign.assigned_employee_id);

                  return (
                    <Box
                      key={assign.assigned_id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: 'rgba(0, 194, 140, 0.1)'
                      }}
                    >
                      <Typography variant="body2">
                        {user?.name || 'Unknown User'}
                      </Typography>
                    </Box>
                  );
                })}
              {assignedShifts.filter(assign => assign.assigned_shift_id === selectedShiftInfo.id).length === 0 && (
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                  No users assigned to this shift.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Footer /> {/* Add Footer at the bottom */}
    </ThemeProvider>
  );
};

export default UserDashboard;