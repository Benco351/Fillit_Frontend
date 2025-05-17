import React, { useState, useEffect } from 'react';
import {Box, Container, Paper, Typography, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, IconButton, Chip, Alert, Snackbar, CircularProgress, CssBaseline, ThemeProvider, Menu, MenuItem as DropdownMenuItem,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker, DatePicker } from '@mui/x-date-pickers';
import { format, startOfWeek, addDays, parseISO, isWithinInterval } from 'date-fns';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Menu as MenuIcon } from '@mui/icons-material';
import { MainTheme } from '../../assets/themes/themes';
import LogoOnly from '../../components/common/Logo';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import { createAvailableShift, getAvailableShiftById, deleteAvailableShiftById, updateAvailableShiftById } from '../../utils/apis/availableShiftApis'; // Adjust the import path as necessary
import { createRequestedShift, getRequestedShifts, updateRequestedShiftById, deleteRequestedShiftById } from '../../utils/apis/requestedShiftsApis'; // Import the API functions
import { getAvailableShifts, getAssignedShifts } from '../../utils/apis/availableShiftApis'; // Import the API functions

import { createAssignedShift } from '../../utils/apis/assignedShiftApis';

//Types
import {AvailableShift, RequestedShift, AssignedShift} from '../../components/CalendarFeatures/ShiftUtils';
import {Employee, availableShiftsResponse, requestedShiftsResponse, assignedShiftsResponse, getShiftColor, calculateDuration} from '../../components/CalendarFeatures/calendarStates';
import {employees} from '../../components/CalendarFeatures/calendarStates';

import { createEmployee } from '../../utils/apis/employeeShiftApis'; 
import { useUserDashboard } from '../../hooks/useUserDashboard';
import ShiftFilters from '../../components/ShiftManagment/ShiftFilters';
import Navbar from '../../components/layout/userNavbar';
import RequestShiftDialog from '../../components/ShiftManagment';
import WeekPicker from '../../components/CalendarFeatures/WeekPicker';
//import AddShift from '../../components/ShiftManagment/AdminSettings';
//import handleAddShift from '../../components/ShiftManagment/AdminSettings';
import UserDashboardTitle from '../../components/sections/UserPage';

const AdminDashboard: React.FC = () => {
     

      // Current user 
    const [currentEmployee, setCurrentEmployee] = useState<Employee>(employees[0]);
  
    //These guys are in useUserDashboard
    const {currentWeekStart, setCurrentWeekStart, availableShifts, setAvailableShifts, requestedShifts, loading, setLoading,
      error, success, filter, setFilter, refreshAvailableShifts, refreshRequestedShifts, setSuccess, 
      setError, setRequestedShifts, assignedShifts, setAssignedShifts, newShift, setNewShift,
      isAddShiftDialogOpen, setIsAddShiftDialogOpen, isRequestShiftDialogOpen, setIsRequestShiftDialogOpen,
      isEditShiftDialogOpen, setIsEditShiftDialogOpen, selectedShift, setSelectedShift, newRequest, setNewRequest, editShift, setEditShift, shiftIdToFetch, setShiftIdToFetch,
      fetchedShift, setFetchedShift, weekDays, loadingAvailable, loadingRequested, setLoadingAvailable, setLoadingRequested, goToNextWeek,
      goToPreviousWeek
    } = useUserDashboard(currentEmployee);

  const navigate = useNavigate();

  // Fetch all shifts (available, requested, and assigned) on component mount
  useEffect(() => {
    const fetchAllShifts = async () => {
      setLoading(true);
      try {
        // Fetch available shifts
        const availableShiftsResponse = await getAvailableShifts();
        if (availableShiftsResponse?.data && Array.isArray(availableShiftsResponse.data)) {
          const mappedAvailableShifts = availableShiftsResponse.data.map((shift: any) => ({
            id: shift.shift_id || shift.id,
            date: shift.shift_date || shift.date,
            start: shift.shift_time_start || shift.start,
            end: shift.shift_time_end || shift.end,
          }));
          setAvailableShifts(mappedAvailableShifts);
        }

        // Fetch requested shifts
        const requestedShiftsResponse = await getRequestedShifts();
        if (requestedShiftsResponse?.data && Array.isArray(requestedShiftsResponse.data)) {
          const mappedRequestedShifts = requestedShiftsResponse.data.map((shift: any) => ({
            request_shift_id: shift.id,
            id: shift.id,
            employeeId: shift.employee_id,
            availableShiftId: shift.availableShiftId,
            notes: shift.notes || '',
            status: shift.status || 'pending',
          }));
          setRequestedShifts(mappedRequestedShifts);
        }

      } catch (err) {
        console.error('Error fetching shifts:', err);
        setError('Failed to fetch shifts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllShifts();
  }, []);

  // Fetch requested shifts on component mount
  useEffect(() => {
    const fetchRequestedShifts = async () => {
      setLoading(true);
      try {
        const response = await getRequestedShifts();
        console.log('Fetched requested shifts:', response);

        if (response?.data && Array.isArray(response.data)) {
          const mappedRequestedShifts = response.data.map((shift: any) => ({
            request_shift_id: shift.id,
            id: shift.id,
            employeeId: shift.employee_id,
            availableShiftId: shift.availableShiftId,
            notes: shift.notes || '',
            status: shift.status || 'pending',
          }));
          setRequestedShifts(mappedRequestedShifts);
        }
      } catch (err) {
        console.error('Error fetching requested shifts:', err);
        setError('Failed to fetch requested shifts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestedShifts();
  }, []);

  // Fetch shifts for the current week
  useEffect(() => {
    fetchShiftsForWeek();
  }, [currentWeekStart]);

  const fetchShiftsForWeek = async () => {
    setLoading(true);
    try {
      const startDate = format(currentWeekStart, 'yyyy-MM-dd');
      const endDate = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');

      // Filter the simulated API response based on the current week's date range
      const filteredAvailableShifts = availableShiftsResponse.filter(shift =>
        isWithinInterval(new Date(shift.date), {
          start: new Date(startDate),
          end: new Date(endDate),
        })
      );

      setAvailableShifts(filteredAvailableShifts);

      setAssignedShifts(assignedShiftsResponse);
    } catch (err) {
      setError('Failed to fetch shifts. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update the polling interval to 15 seconds
  const POLLING_INTERVAL = 15000; // Poll every 15 seconds instead of 10

  // Update the refreshDashboard function to ensure proper merging of requested shifts
  const refreshDashboard = async () => {
    try {
      const [availableResponse, requestedResponse] = await Promise.all([
        getAvailableShifts(),
        getRequestedShifts()
      ]);

      // Update available shifts
      if (availableResponse?.data) {
        const mappedAvailableShifts = availableResponse.data.map((shift: { shift_id: any; id: any; shift_date: any; date: any; shift_time_start: any; start: any; shift_time_end: any; end: any; }) => ({
          id: shift.shift_id || shift.id,
          date: shift.shift_date || shift.date,
          start: shift.shift_time_start || shift.start,
          end: shift.shift_time_end || shift.end,
        }));
        setAvailableShifts(mappedAvailableShifts);
      }

      // Update requested shifts
      if (requestedResponse?.data) {
        const mappedRequestedShifts = requestedResponse.data.map(shift => ({
          id: shift.id,
          request_shift_id: shift.id,
          employeeId: shift.employeeId,
          availableShiftId: shift.availableShiftId,
          notes: shift.notes || '',
          status: shift.status || 'pending',
        }));

        setRequestedShifts(prevShifts => {
          const existingShiftsMap = new Map(prevShifts.map(shift => [shift.id, shift]));
          mappedRequestedShifts.forEach(newShift => {
            existingShiftsMap.set(newShift.id, newShift);
          });
          return Array.from(existingShiftsMap.values());
        });
      }
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
    }
  };

  // Add a more robust polling effect for requested shifts
  useEffect(() => {
    const pollShifts = async () => {
      try {
        const response = await getRequestedShifts();
        if (response?.data && Array.isArray(response.data)) {
          const mappedShifts = response.data.map(shift => ({
            id: shift.id,
            request_shift_id: shift.id,
            employeeId: shift.employeeId,
            availableShiftId: shift.availableShiftId,
            notes: shift.notes || '',
            status: shift.status || 'pending',
          }));

          setRequestedShifts(prevShifts => {
            const existingShiftsMap = new Map(prevShifts.map(shift => [shift.id, shift]));
            mappedShifts.forEach(newShift => {
              existingShiftsMap.set(newShift.id, newShift);
            });
            return Array.from(existingShiftsMap.values());
          });
        }
      } catch (err) {
        console.error('Error polling shifts:', err);
      }
    };

    pollShifts();
    const interval = setInterval(pollShifts, POLLING_INTERVAL); // Use the 15 second interval
    return () => clearInterval(interval);
  }, []);

  // Add automatic refresh after actions
  useEffect(() => {
    const refreshAllData = async () => {
      try {
        await refreshDashboard(); // This refreshes both available and requested shifts
      } catch (err) {
        console.error('Error during auto-refresh:', err);
      }
    };

    // Initial refresh
    refreshAllData();

    // Set up polling interval
    const interval = setInterval(refreshAllData, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this only sets up on mount


  // Handle adding a new shift
  const handleAddShift = async () => {
    setLoading(true);
    try {
      console.log('Adding new shift:', newShift);

      const apiResponse = await createAvailableShift({
        date: new Date(newShift.date),
        start: newShift.start,
        end: newShift.end,
      });

      console.log('API response:', apiResponse);

      let shiftId = null;

      if (apiResponse && apiResponse.shift_id !== undefined) {
        shiftId = apiResponse.shift_id;
      } else if (apiResponse && apiResponse.data && apiResponse.data.shift_id !== undefined) {
        shiftId = apiResponse.data.shift_id;
      }

      if (shiftId === null) {
        console.error('Could not find shift_id in API response');
        setError('Shift created but ID is missing. Please refresh.');
        return;
      }

      const addedShift: AvailableShift = {
        id: shiftId,
        date: format(new Date(newShift.date), 'yyyy-MM-dd'),
        start: newShift.start,
        end: newShift.end,
      };

      // Update local state
      setAvailableShifts((prev) => [...prev, addedShift]);

      // Persist the new shift in the simulated API response
      availableShiftsResponse.push(addedShift);

      setSuccess('Shift added successfully');
      setIsAddShiftDialogOpen(false);
    } catch (err) {
      setError('Failed to add shift. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  const handleEditShift = async () => {
    if (!editShift) return;

    setLoading(true);
    try {
      console.log('Updating shift:', editShift);

      // Call the API to update the shift
      const updatedShiftResponse = await updateAvailableShiftById(editShift.id, {
        date: new Date(editShift.date),
        start: editShift.start,
        end: editShift.end,
      });

      console.log('Updated shift response:', updatedShiftResponse);

      // Update the local state with the updated shift
      setAvailableShifts((prev) =>
        prev.map((shift) =>
          shift.id === editShift.id
            ? { ...shift, date: editShift.date, start: editShift.start, end: editShift.end }
            : shift
        )
      );

      // Persist the updated shift in the simulated API response
      const index = availableShiftsResponse.findIndex((shift) => shift.id === editShift.id);
      if (index !== -1) {
        availableShiftsResponse[index] = { ...availableShiftsResponse[index], ...editShift };
      }

      setSuccess('Shift updated successfully');
      setIsEditShiftDialogOpen(false);
    } catch (err) {
      setError('Failed to update shift. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestShiftFromEditDialog = async () => {
    if (!editShift) return;
  
    setLoading(true);
    try {
      const payload = {
        employeeId: currentEmployee.id,
        shiftSlotId: editShift.id,
        notes: '', // Optional: Add a default or empty note
      };
  
      console.log('Requesting shift with payload:', payload); // Log the payload
  
      // Call the createRequestedShift function to handle the request
      const newRequestResponse = await createRequestedShift(payload);
  
      console.log('Requested shift response:', newRequestResponse); // Log the response
  

      setSuccess('Shift requested successfully');
      setIsEditShiftDialogOpen(false); // Close the edit dialog after requesting
    } catch (err) {
      const errorMessage =
        (err as any)?.response?.data?.message || 'Failed to request shift. Please try again.';
      if (err instanceof Error) {
        console.error('Failed to request shift:', (err as any)?.response || err.message || err);
      } else {
        console.error('Failed to request shift:', err);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle accepting a shift
  const handleAcceptShift = async (requestedShiftId: number) => {
    setLoading(true);
    try {
      console.log('Accepting shift with ID:', requestedShiftId);

      // Find the requested shift details
      const requestedShift = requestedShifts.find(shift => shift.id === requestedShiftId);
      if (!requestedShift) {
        throw new Error('Requested shift not found');
      }

      // Call the API to create an assigned shift
      await createAssignedShift({
        employeeId: requestedShift.employeeId,
        shiftSlotId: requestedShift.availableShiftId,
      });

      // Call the API to update the requested shift status to "approved"
      await updateRequestedShiftById(requestedShiftId, { status: 'approved' });

      // Update the local state to reflect the change
      setRequestedShifts(prev =>
        prev.map(shift =>
          shift.id === requestedShiftId ? { ...shift, status: 'approved' } : shift
        )
      );

      setSuccess('Shift accepted successfully');
    } catch (err) {
      console.error('Failed to accept shift:', err);
      setError('Failed to accept shift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDenyRequestedShift = async (requestedShiftId: number) => {
    setLoading(true);
    try {
      console.log('Denying requested shift with ID:', requestedShiftId);

      // Call the API to update the requested shift status to "denied"
      await updateRequestedShiftById(requestedShiftId, { status: 'denied' });

      // Refresh the requested shifts to ensure the denied status persists
      const updatedRequestedShifts = await getRequestedShifts();
      if (updatedRequestedShifts?.data) {
        setRequestedShifts(
          updatedRequestedShifts.data.map(shift => ({
            ...shift,
            request_shift_id: shift.id, // Add the missing property
          }))
        );
      }

      setSuccess('Requested shift denied successfully.');
    } catch (err) {
      console.error('Failed to deny requested shift:', err);
      setError('Failed to deny requested shift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequestedShift = async (requestedShiftId: number) => {
    setLoading(true);
    try {
      console.log('Deleting requested shift with ID:', requestedShiftId);

      // Call the API to delete the requested shift
      await deleteRequestedShiftById(requestedShiftId);

      // Update the local state to remove the deleted shift
      setRequestedShifts(prev => prev.filter(shift => shift.id !== requestedShiftId));

      setSuccess('Requested shift deleted successfully');
    } catch (err) {
      console.error('Failed to delete requested shift:', err);
      setError('Failed to delete requested shift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialogFromCalendar = (shift: AvailableShift) => {
    setEditShift(shift); // Set the selected shift for editing
    setIsEditShiftDialogOpen(true); // Open the edit dialog
  };

// Enhanced handleGetShiftById function with better debugging
const handleGetShiftById = async () => {
  if (!shiftIdToFetch) {
    setError('Please enter a valid shift ID.');
    return;
  }

  setLoading(true);
  try {
    const response = await getAvailableShiftById(Number(shiftIdToFetch));
    
    // Log the entire response to see its structure
    console.log('Complete API response:', response);
    
    // Check where the data might be located in the response
    let shiftData;
    if (response.data && response.data.data) {
      // If the data is nested (common in API responses with metadata)
      shiftData = response.data.data;
      console.log('Found nested data:', shiftData);
    } else if (response.data) {
      // If data is directly in the response
      shiftData = response.data;
      console.log('Found direct data:', shiftData);
    } else {
      // No data found
      console.log('No data found in response');
      setError('No shift data found in the response.');
      setFetchedShift(null);
      setLoading(false);
      return;
    }
    
    // Transform the data regardless of where it was found
    const transformedShift: AvailableShift = {
      id: shiftData.shift_id || shiftData.id || Number(shiftIdToFetch),
      date: shiftData.date || shiftData.shift_date || '',
      start: shiftData.start || shiftData.shift_start || '',
      end: shiftData.end || shiftData.shift_end || ''
    };
    
    console.log('Transformed shift data:', transformedShift);
    setFetchedShift(transformedShift);
    setSuccess(`Shift with ID ${shiftIdToFetch} fetched successfully.`);
  } catch (err) {
    console.error('Error fetching shift:', err);
    setError('Failed to fetch shift. Please try again.');
    setFetchedShift(null);
  } finally {
    setLoading(false);
  }
};

// Update the getShiftStatus function to show denied shifts as "available" for the admin
const getShiftStatus = (availableShiftId: number): string => {
  const requestedShift = requestedShifts.find(s => s.availableShiftId === availableShiftId);

  if (requestedShift) {
    // If the shift is denied, show it as "available" for the admin
    if (requestedShift.status === 'denied' && currentEmployee.id === 1) {
      return 'available';
    }
    return requestedShift.status;
  }

  const isAssigned = assignedShifts.some(s => s.availableShiftId === availableShiftId);
  return isAssigned ? 'assigned' : 'available';
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
          requestedShifts.some(req => 
            req.availableShiftId === shift.id && req.status === 'pending'
          )
        );
      case 'accepted':
        return availableShifts.filter(shift =>
          requestedShifts.some(req => 
            req.availableShiftId === shift.id && req.status === 'approved'
          ) || assignedShifts.some(assign => assign.availableShiftId === shift.id)
        );
      default:
        return availableShifts;
    }
  };

  const filteredShifts = getFilteredShifts();

  return (
    <ThemeProvider theme={MainTheme}>
      <CssBaseline />
      <Box
        sx={{
          backgroundColor: '#0a5e0f', 
          minHeight: '100vh',
          py: 4,
          px: 2,
        }}
      >
        <Container
          maxWidth={false}
          sx={{ 
            px: { xs: 1, sm: 2, md: 3 },
            width: '100%',
            maxWidth: '100%',
            // Remove the backgroundColor property from Container to make it transparent
          }}
        >
          <Navbar />

          {/* Top section layout matching UserDashboard */}
          <Box sx={{ my: 3 }}>
            <UserDashboardTitle title="Admin Management System" />

            {/* Filters - Matching User Dashboard position */}
            <Box sx={{ 
              mb: 4, 
              display: 'flex', 
              justifyContent: 'center'
            }}>
              <ShiftFilters filter={filter} setFilter={setFilter} />
            </Box>

            {/* Frame Box */}
            <Box
              sx={{
                border: '2px solid rgba(0, 194, 140, 0.2)',
                borderRadius: '12px',
                padding: '24px',
                backgroundColor: 'secondary.main', // Changed to match UserDashboard's grey
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                mb: 4,
              }}
            >
              {/* Combined top row for employee selection, navigation, and actions */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                  mb: 3,
                }}
              >
                {/* Left side: Employee selection */}
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
                    width: { xs: '100%', md: 200 },
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

                {/* Center: Add Shift Button (moved from right) */}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsAddShiftDialogOpen(true)}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.1), rgba(0, 194, 140, 0.2))',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(0, 194, 140, 0.3)',
                    borderRadius: '10px',
                    color: '#00c28c',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.15), rgba(0, 194, 140, 0.25))',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  Add Available Shift
                </Button>

                {/* Right side: Week navigation (moved from center) */}
                <Box sx={{ 
                  display: 'flex',
                  gap: 2,
                }}>
                  <Button 
                    variant="outlined" 
                    onClick={goToPreviousWeek}
                    sx={{
                      background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.1), rgba(0, 194, 140, 0.2))',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(0, 194, 140, 0.3)',
                      borderRadius: '10px',
                      color: '#00c28c',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.15), rgba(0, 194, 140, 0.25))',
                        transform: 'translateY(-1px)',
                      }
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
                    sx={{
                      background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.1), rgba(0, 194, 140, 0.2))',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(0, 194, 140, 0.3)',
                      borderRadius: '10px',
                      color: '#00c28c',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.15), rgba(0, 194, 140, 0.25))',
                        transform: 'translateY(-1px)',
                      }
                    }}
                  >
                    Next Week
                  </Button>
                </Box>
              </Box>

              {/* Calendar Grid */}
              <Box
                sx={{
                  border: '2px solid rgba(0, 194, 140, 0.2)',
                  borderRadius: '12px',
                  padding: '24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', // Match UserDashboard
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  margin: '24px 0',
                }}
              >
                {/* Existing calendar grid content */}
                <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto' }}>
                  {weekDays.map((day, index) => (
                    <Box
                      key={index}
                      sx={{
                        flex: '1 1 0',
                        minWidth: 150,
                        maxWidth: 'calc(100% / 7)',
                        height: '600px',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#e8f5e9', // Green-tinted background like user
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
                        backgroundSize: '100% 25px',
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
                      
                      {/* Shifts for this day */}
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
                            const backgroundColor = 
                              status === 'denied' ? '#f44336' : // Red for denied shifts
                              status === 'pending' ? '#ff9800' : // Orange for pending shifts
                              getShiftColor(status); // Default color for other statuses

                            const requestedShift = requestedShifts.find(req => req.availableShiftId === shift.id);
                            const requester = requestedShift
                              ? employees.find(emp => emp.id === requestedShift.employeeId)
                              : null;

                            const showPendingRequestBar = requestedShift && requestedShift.status === 'pending';

                            return (
                              <Box key={shift.id} sx={{ mb: 1, position: 'relative' }}>
                                {/* Shift slot - match user dashboard size and round style */}
                                <Box
                                  sx={{
                                    p: 1,
                                    borderRadius: '10px', // Rounded corners
                                    backgroundColor,
                                    color: 'white',
                                    position: 'relative',
                                    minHeight: 48, // Minimum height to match user dashboard
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                  >
                                    {shift.start.substring(0, 5)} - {shift.end.substring(0, 5)}
                                  </Typography>
                                  {status === 'approved' && (
                                    <Typography
                                      variant="caption"
                                      display="block"
                                      sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                                    >
                                      Request Approved
                                    </Typography>
                                  )}
                                  {status === 'assigned' && (
                                    <Typography
                                      variant="caption"
                                      display="block"
                                      sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                                    >
                                      {getAssignedEmployeeName(shift.id)}
                                    </Typography>
                                  )}
                                  {/* Edit Button */}
                                  <IconButton
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: 2,
                                      right: 2,
                                      color: 'white',
                                      padding: { xs: 0.5, sm: 1 }
                                    }}
                                    onClick={() => handleOpenEditDialogFromCalendar(shift)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                                {/* Orange rectangle for pending request directly under the slot, no space */}
                                {showPendingRequestBar && (
                                  <Box
                                    sx={{
                                      width: '100%',
                                      minHeight: 60,
                                      backgroundColor: '#ff9800',
                                      borderRadius: '0 0 4px 4px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: 0.5,
                                      zIndex: 2,
                                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                      mt: 0 // No space between slot and rectangle
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      sx={{
                                        color: 'white',
                                        backgroundColor: '#ff9800',
                                        '&:hover': { backgroundColor: '#f57c00' },
                                        fontSize: '1rem'
                                      }}
                                      onClick={e => {
                                        e.stopPropagation();
                                        if (requester) {
                                          alert(`User Info:\nName: ${requester.name}\nEmail: ${requester.email}`);
                                        } else {
                                          alert('User Info not found');
                                        }
                                      }}
                                    >
                                      i
                                    </IconButton>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      sx={{
                                        background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.1), rgba(0, 194, 140, 0.2))',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(0, 194, 140, 0.3)',
                                        borderRadius: '10px',
                                        color: '#00c28c',
                                        '&:hover': {
                                          background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.15), rgba(0, 194, 140, 0.25))',
                                          transform: 'translateY(-1px)',
                                        }
                                      }}
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleAcceptShift(requestedShift.id);
                                      }}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      sx={{
                                        borderColor: '#fff',
                                        color: '#fff',
                                        minWidth: 60,
                                        mx: 0.5,
                                        '&:hover': { borderColor: '#fff', backgroundColor: '#e57373', color: '#fff' }
                                      }}
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleDenyRequestedShift(requestedShift.id);
                                      }}
                                    >
                                      Deny
                                    </Button>
                                  </Box>
                                )}
                                {status === 'denied' && currentEmployee.id !== 1 && (
                                  <Chip
                                    label="Denied"
                                    size="small"
                                    sx={{ 
                                      fontSize: { xs: '0.5rem', sm: '0.6rem' }, 
                                      height: { xs: 14, sm: 16 }, 
                                      backgroundColor: '#d32f2f',
                                      mt: 0.5 
                                    }}
                                  />
                                )}
                                {/* Admin controls */}
                              </Box>
                            );
                          })}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Get Shift by ID Section - Moved below calendar */}
          <Box
            sx={{
              mb: 4,
              p: { xs: 2, sm: 3 },
              backgroundColor: '#0a5e0f',
              borderRadius: 0,
              border: '2px solid #e0e0e0',
            }}
          >
            <Typography
              variant="h6"
              sx={{ 
                color: 'white', 
                mb: 2,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Get Available Shift by ID
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2, 
              alignItems: { xs: 'stretch', sm: 'center' }, 
              mb: 2 
            }}>
              <TextField
                label="Shift ID"
                type="number"
                value={shiftIdToFetch}
                onChange={(e) => setShiftIdToFetch(Number(e.target.value) || '')}
                sx={{ 
                  width: { xs: '100%', sm: 200 },
                  backgroundColor: 'white'
                }}
              />
              <Button
                variant="contained"
                onClick={handleGetShiftById}
                disabled={loading}
                sx={{ 
                  minWidth: { xs: '100%', sm: 120 }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Fetch Shift'}
              </Button>
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

          {/* Edit Shift Dialog */}
          <Dialog open={isEditShiftDialogOpen} onClose={() => setIsEditShiftDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Shift</DialogTitle>
            <DialogContent>
              {editShift && (
                <Box sx={{ mt: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date"
                      value={parseISO(editShift.date)}
                      onChange={(newDate) => {
                        if (newDate) {
                          setEditShift((prev) => prev && { ...prev, date: format(newDate, 'yyyy-MM-dd') });
                        }
                      }}
                      sx={{ width: '100%', mb: 2 }}
                    />
                  </LocalizationProvider>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        label="Start Time"
                        value={parseISO(`2023-01-01T${editShift.start}`)}
                        onChange={(newTime) => {
                          if (newTime) {
                            setEditShift((prev) => prev && { ...prev, start: format(newTime, 'HH:mm:ss') });
                          }
                        }}
                        sx={{ width: '100%' }}
                      />
                    </LocalizationProvider>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        label="End Time"
                        value={parseISO(`2023-01-01T${editShift.end}`)}
                        onChange={(newTime) => {
                          if (newTime) {
                            setEditShift((prev) => prev && { ...prev, end: format(newTime, 'HH:mm:ss') });
                          }
                        }}
                        sx={{ width: '100%' }}
                      />
                    </LocalizationProvider>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsEditShiftDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleEditShift} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleRequestShiftFromEditDialog}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Request Shift'}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={async () => {
                  if (editShift) {
                    setLoading(true);
                    try {
                      await deleteAvailableShiftById(editShift.id);
                      setSuccess('Shift deleted successfully');
                      setIsEditShiftDialogOpen(false);
                      setAvailableShifts(prev => prev.filter(shift => shift.id !== editShift.id));
                    } catch (error) {
                      setError('Failed to delete shift. Please try again.');
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Delete Shift'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Request Shift Dialog */}
          
          <RequestShiftDialog/>

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

export default AdminDashboard;