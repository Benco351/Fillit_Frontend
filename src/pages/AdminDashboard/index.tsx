import React, { useState, useEffect, useMemo } from 'react';
import {Box, Container, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
IconButton, Alert, Snackbar, CircularProgress, CssBaseline, ThemeProvider, MenuItem as DropdownMenuItem,
Chip
} from '@mui/material';
import { LocalizationProvider, TimePicker, DatePicker } from '@mui/x-date-pickers';
import { format, addDays, parseISO, isWithinInterval } from 'date-fns';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Menu as MenuIcon, Info as InfoIcon } from '@mui/icons-material';
import { MainTheme } from '../../assets/themes/themes';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import { createAvailableShift, getAvailableShiftById, deleteAvailableShiftById, updateAvailableShiftById } from '../../utils/apis/availableShiftApis'; // Adjust the import path as necessary
import { createRequestedShift, deleteRequestedShiftById, getRequestedShifts, updateRequestedShiftById } from '../../utils/apis/requestedShiftsApis'; // Import the API functions
import { getAvailableShifts, getAssignedShifts } from '../../utils/apis/availableShiftApis'; // Import the API functions
import { createAssignedShift, deleteAssignedShiftById } from '../../utils/apis/assignedShiftApis';
//Types
import {AvailableShift, RequestedShift, SelectedShift} from '../../components/CalendarFeatures/ShiftUtils';
import {Employee, availableShiftsResponse, assignedShiftsResponse} from '../../components/CalendarFeatures/calendarStates';
import { getEmployees } from '../../utils/apis/employeeShiftApis';
//import { createEmployee } from '../../utils/apis/employeeShiftApis'; 
import { useUserDashboard } from '../../hooks/useUserDashboard';
import ShiftFilters from '../../components/ShiftManagment/ShiftFilters';
import Navbar from '../../components/layout/userNavbar';
import RequestShiftDialog from '../../components/ShiftManagment';
import WeekPicker from '../../components/CalendarFeatures/WeekPicker';
//import AddShift from '../../components/ShiftManagment/AdminSettings';
//import handleAddShift from '../../components/ShiftManagment/AdminSettings';
import UserDashboardTitle from '../../components/sections/UserPage';
import AIChatPopup from '../../components/aiChat';
import { GlobalStyles } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';


const AdminDashboard: React.FC = () => {

     
      // Current user 
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
    const {currentWeekStart, setCurrentWeekStart, availableShifts, setAvailableShifts, requestedShifts, loading, setLoading,
      error, success, filter, setFilter, setSuccess, setError, setRequestedShifts, assignedShifts, setAssignedShifts, newShift, 
      setNewShift, isAddShiftDialogOpen, setIsAddShiftDialogOpen, isEditShiftDialogOpen, setIsEditShiftDialogOpen, 
      editShift, setEditShift, shiftIdToFetch, setFetchedShift, weekDays, goToNextWeek, goToPreviousWeek, denyDialogOpen, setDenyDialogOpen, 
      setDenyRequestId, denyRequestId, infoDialogOpen, setInfoDialogOpen, selectedShiftInfo, setSelectedShiftInfo
      
    } = useUserDashboard(currentEmployee);


  // Employees state
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Open deny dialog
  const handleOpenDenyDialog = (requestId: number) => {
    setDenyRequestId(requestId);
    setDenyDialogOpen(true);
  };

  // Confirm deny action
  const handleConfirmDeny = async () => {
    if (denyRequestId !== null) {
      await handleDenyRequestedShift(denyRequestId);
      setDenyDialogOpen(false);
      setDenyRequestId(null);
    }
  };


  // Close deny dialog without action
  const handleCancelDeny = () => {
    setDenyDialogOpen(false);
    setDenyRequestId(null);
  };

  // Open info dialog to see shift details
  const handleOpenInfoDialog = (shift: AvailableShift) => {
    // Map the shift to SelectedShift type
    //fetch the shift details by ID if needed
    setSelectedShiftInfo(shift);
    setInfoDialogOpen(true);
  };

  // Fetch all shifts and employees on mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch employees
        const employeesResponse = await getEmployees();
        // Accept both array and {data: array} for compatibility
        let employeesArr = [];
        if (Array.isArray(employeesResponse)) {
          employeesArr = employeesResponse;
        } else if (employeesResponse?.data && Array.isArray(employeesResponse.data)) {
          employeesArr = employeesResponse.data;
        }
        setEmployees(
          employeesArr.map((emp: any) => ({
            id: emp.employee_id ?? emp.id,
            name: emp.employee_name ?? emp.name,
            email: emp.employee_email ?? emp.email,
            admin: emp.employee_admin ?? emp.admin,
            phone: emp.employee_phone ?? emp.phone,
          }))
        );

        console.log(employees)
        // Fetch available shifts
        const availableShiftsResponse = await getAvailableShifts();
        if (availableShiftsResponse?.data && Array.isArray(availableShiftsResponse.data)) {
          const mappedAvailableShifts = availableShiftsResponse.data.map((shift: any) => ({
            id: shift.shift_id || shift.id,
            date: shift.shift_date || shift.date,
            start: shift.shift_time_start || shift.start,
            end: shift.shift_time_end || shift.end,
            shift_slots_amount: shift.shift_slots_amount || 0, 
            shift_slots_taken: shift.shift_slots_taken !== undefined ? shift.shift_slots_taken : 0, // default to 0
          }));
          setAvailableShifts(mappedAvailableShifts);
        }

        // Fetch assigned shifts
        const assignedShiftsResponse = await getAssignedShifts();
        if (assignedShiftsResponse?.data && Array.isArray(assignedShiftsResponse.data)) {
          const mappedAssignedShifts = assignedShiftsResponse.data.map((shift: any) => ({
            assigned_id: shift.assigned_id,
            assigned_employee_id: shift.assigned_employee_id,
            assigned_shift_id: shift.assigned_shift_id,
            availableShift: shift.availableShift,
            employee: shift.employee,
          }));
          setAssignedShifts(mappedAssignedShifts);
        }
      } catch (err) {
        // Handle error
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Update the polling interval to 7 seconds
  const POLLING_INTERVAL = 7000; // Poll every 7 seconds

  // Update the refreshDashboard function to ensure proper merging of requested shifts
  const refreshDashboard = async () => {
    try {
      const [employeesResponse, availableResponse, requestedResponse, assignedResponse] = await Promise.all([
        getEmployees(),
        getAvailableShifts(),
        getRequestedShifts(),
        getAssignedShifts()
      ]);

      // Update employees
      let employeesArr = [];
      if (Array.isArray(employeesResponse)) {
        employeesArr = employeesResponse;
      } else if (employeesResponse?.data && Array.isArray(employeesResponse.data)) {
        employeesArr = employeesResponse.data;
      }
      setEmployees(
        employeesArr.map((emp: any) => ({
          id: emp.employee_id ?? emp.id,
          name: emp.employee_name ?? emp.name,
          email: emp.employee_email ?? emp.email,
          admin: emp.employee_admin ?? emp.admin,
          phone: emp.employee_phone ?? emp.phone,
        }))
      );

      // Update available shifts
      if (availableResponse?.data) {
        const mappedAvailableShifts = availableResponse.data.map((shift: any) => ({
          id: shift.shift_id || shift.id,
          date: shift.shift_date || shift.date,
          start: shift.shift_time_start || shift.start,
          end: shift.shift_time_end || shift.end,
          shift_slots_amount: shift.shift_slots_amount || 0, 
          shift_slots_taken: shift.shift_slots_taken !== undefined ? shift.shift_slots_taken : 0, // default to 0
        }));
        setAvailableShifts(mappedAvailableShifts);
      }

      // Update requested shifts
      if (requestedResponse?.data) {
        const mappedRequestedShifts = requestedResponse.data.map((shift: any) => ({
          id: shift.id,
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

      // Update assigned shifts
      if (assignedResponse?.data) {
        const mappedAssignedShifts = assignedResponse.data.map((shift: any) => ({
          id: shift.assigned_id,
          employeeId: shift.assigned_employee_id,
          availableShiftId: shift.assigned_shift_id,
          availableShift: shift.availableShift,
          employee: shift.employee,
        }));
        setAssignedShifts(mappedAssignedShifts);
      }
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
    }
  };

 
  useEffect(() => {
    const pollShifts = async () => {
      try {
        const response = await getRequestedShifts();
        if (response?.data && Array.isArray(response.data)) {
          const mappedShifts = response.data.map(shift => ({
            id: shift.id,
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

    const interval = setInterval(pollShifts, POLLING_INTERVAL); // Use the 7 second interval
    return () => clearInterval(interval);
  }, []);

  // Remove the separate polling useEffect for requested shifts
  // Add a single polling effect for all dashboard data
  useEffect(() => {
    let isMounted = true;
    const fetchAndUpdateAll = async () => {
      setLoading(true);
      try {
        const [employeesResponse, availableResponse, requestedResponse, assignedResponse] = await Promise.all([
          getEmployees(),
          getAvailableShifts(),
          getRequestedShifts(),
          getAssignedShifts()
        ]);
        if (isMounted) {
          // Employees
          let employeesArr = [];
          if (Array.isArray(employeesResponse)) {
            employeesArr = employeesResponse;
          } else if (employeesResponse?.data && Array.isArray(employeesResponse.data)) {
            employeesArr = employeesResponse.data;
          }
          setEmployees(
            employeesArr.map((emp: any) => ({
              id: emp.employee_id ?? emp.id,
              name: emp.employee_name ?? emp.name,
              email: emp.employee_email ?? emp.email,
              admin: emp.employee_admin ?? emp.admin,
              phone: emp.employee_phone ?? emp.phone,
            }))
          );
          // Available shifts
          if (availableResponse?.data && Array.isArray(availableResponse.data)) {
            setAvailableShifts(availableResponse.data.map((shift: any) => ({
              id: shift.shift_id || shift.id,
              date: shift.shift_date || shift.date,
              start: shift.shift_time_start || shift.start,
              end: shift.shift_time_end || shift.end,
              shift_slots_amount: shift.shift_slots_amount || 0,
              shift_slots_taken: shift.shift_slots_taken !== undefined ? shift.shift_slots_taken : 0, // default to 0
            })));
          }
          // Requested shifts
          if (requestedResponse?.data && Array.isArray(requestedResponse.data)) {
            setRequestedShifts(requestedResponse.data.map((shift: any) => ({
              id: shift.id,
              employeeId: shift.employeeId,
              availableShiftId: shift.availableShiftId,
              notes: shift.notes || '',
              status: shift.status || 'pending',
            })));
          }
          // Assigned shifts
          if (assignedResponse?.data && Array.isArray(assignedResponse.data)) {
            setAssignedShifts(assignedResponse.data.map((shift: any) => ({
              id: shift.assigned_id,
              assigned_id: shift.assigned_id,
              employeeId: shift.assigned_employee_id,
              assigned_employee_id: shift.assigned_employee_id,
              availableShiftId: shift.assigned_shift_id,
              assigned_shift_id: shift.assigned_shift_id,
              availableShift: shift.availableShift,
              employee: shift.employee,
            })));
          }
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAndUpdateAll();
    const interval = setInterval(fetchAndUpdateAll, POLLING_INTERVAL);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [setAvailableShifts, setRequestedShifts, setAssignedShifts, setEmployees, setLoading]);

  // Handle adding a new shift
  const handleAddShift = async () => {
    setLoading(true);
    try {
      console.log('Adding new shift:', newShift);

      const apiResponse = await createAvailableShift({
        date: new Date(newShift.date),
        start: newShift.start,
        end: newShift.end,
        shift_slots_amount: newShift.shift_slots_amount // Add this line
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


  // Function that calls delete assigned shift by ID
  const handleDeleteAssignedShift = async (assignedShiftId: number, requestedShiftId: number) => {
    setLoading(true);
    try {
        console.log('Attempting to delete assigned shift:', assignedShiftId);
        
        if (!assignedShiftId) {
            throw new Error('No shift ID provided');
        }

        // Add validation to check if shift exists in local state
        const assignedShift = assignedShifts.find(shift => shift.assigned_id === assignedShiftId);
        if (!assignedShift) {
            throw new Error(`Assigned shift with ID ${assignedShiftId} not found in local state`);
        }

        // Find the corresponding requested shift based on employee and available shift
        const correspondingRequestedShift = requestedShifts.find(req => 
          req.employeeId === assignedShift.assigned_employee_id && 
          req.availableShiftId === assignedShift.assigned_shift_id &&
          req.status === 'approved'
        );

        console.log('Found corresponding requested shift:', correspondingRequestedShift);

        // Delete the assigned shift first
        await deleteAssignedShiftById(assignedShiftId);
        
        // If we found a corresponding requested shift, delete it
        if (correspondingRequestedShift) {
          console.log('Deleting corresponding requested shift:', correspondingRequestedShift.id);
          await deleteRequestedShiftById(correspondingRequestedShift.id);
          
          // Update local requested shifts state
          setRequestedShifts(prev => prev.filter(req => req.id !== correspondingRequestedShift.id));
        }

        // Update local assigned shifts state
        setAssignedShifts(prev => prev.filter(shift => shift.assigned_id !== assignedShiftId));
        
        // Decrement shift_slots_taken for the available shift
        setAvailableShifts(prev =>
          prev.map(shift =>
            shift.id === assignedShift.assigned_shift_id
              ? { ...shift, shift_slots_taken: Math.max((shift.shift_slots_taken || 1) - 1, 0) }
              : shift
          )
        );
        
        // Close dialog and refresh data
        setInfoDialogOpen(false);
        await refreshDashboard();

        setSuccess('Assigned shift and corresponding request deleted successfully');
    } catch (err: any) {
        console.error('Error deleting assigned shift:', err);
        setError(err.message || 'Failed to delete assigned shift. Please try again.');
        // Keep the dialog open if there's an error
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

  const handleDenyRequestedShift = async (requestedShiftId: number) => {
    setLoading(true);
    try {
      console.log('Denying requested shift with ID:', requestedShiftId);

      // Call the API to update the requested shift status to "denied"
      await updateRequestedShiftById(requestedShiftId, { status: 'denied' });

      const updatedRequestedShifts = await getRequestedShifts();
      if (updatedRequestedShifts?.data) {
        setRequestedShifts(
          updatedRequestedShifts.data.map(shift => ({
            id: shift.id,
            employeeId: shift.employeeId,
            availableShiftId: shift.availableShiftId,
            notes: shift.notes || '',
            status: shift.status || 'pending',
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

  const handleOpenEditDialogFromCalendar = (shift: AvailableShift) => {
    setEditShift(shift); // Set the selected shift for editing
    setIsEditShiftDialogOpen(true); // Open the edit dialog
  };

  const handleAcceptRequest = async (requestedShift: RequestedShift) => {
    setLoading(true);
    try {
      await createAssignedShift({
        employeeId: requestedShift.employeeId,
        shiftSlotId: requestedShift.availableShiftId
      });

      // Increment shift_slots_taken for the assigned shift
      setAvailableShifts(prev =>
        prev.map(shift =>
          shift.id === requestedShift.availableShiftId
            ? { ...shift, shift_slots_taken: (shift.shift_slots_taken || 0) + 1 }
            : shift
        )
      );

      // Then update the request status to approved
      await updateRequestedShiftById(requestedShift.id, { status: 'approved' });

      setRequestedShifts(prev =>
        prev.map(shift =>
          shift.id === requestedShift.id
            ? { ...shift, status: 'approved' }
            : shift
        )
      );

      setSuccess('Shift assigned successfully');
    } catch (err) {
      console.error('Error assigning shift:', err);
      setError('Failed to assign shift. Please try again.');
    } finally {
      setLoading(false);
    }
  };


// Updated getFilteredShifts function
const combinedShifts = useMemo(() => {
  // Step 1: Create a map of availableShifts for quick ID lookups
  const availableShiftsMap = new Map(
    availableShifts.map(shift => [shift.id, shift])
  );
  
  // Step 2: Process assigned shifts to extract their underlying available shifts
  const assignedAvailableShifts = assignedShifts
    .filter(assigned => assigned.availableShift) // Only process those with availableShift
    .map(assigned => {
      const availableShift = assigned.availableShift;
      
      // Normalize shift data regardless of API format
      return {
        id: availableShift.shift_id || availableShift.id,
        date: availableShift.shift_date || availableShift.date,
        start: availableShift.shift_time_start || availableShift.start,
        end: availableShift.shift_time_end || availableShift.end,
        shift_slots_amount: availableShift.shift_slots_amount || 1, // Default to 1 if not specified
        shift_slots_taken: availableShift.shift_slots_taken || 1, // Default to 1 if not specified
        isFromAssigned: true // Flag to identify this came from an assigned shift
      };
    });
    
  // Step 3: Build a complete set of shifts
  // For each assigned shift, if it doesn't exist in availableShifts, add it
  const completeShifts = [...availableShifts];
  
  assignedAvailableShifts.forEach(assignedShift => {
    if (!availableShiftsMap.has(assignedShift.id)) {
      completeShifts.push(assignedShift);
    }
  });
  
  // For deep debugging
  console.log('Available shifts:', availableShifts);
  console.log('Assigned shifts with availableShift:', assignedAvailableShifts);
  console.log('Combined shifts result:', completeShifts);
  
  return completeShifts;
}, [availableShifts, assignedShifts]);

  //sidescroll

  return (
    <ThemeProvider theme={MainTheme}>
      
      <CssBaseline />
      <Box
        sx={{
          backgroundColor: '#18191c !important',
          minHeight: '100vh',
          py: 4,
          px: 2,
          overflowX: 'hidden' // prevents horizontal scroll
        }}
      >
        <Container
          maxWidth={false}
          sx={{ 
            px: { xs: 1, sm: 2, md: 3 },
            width: '100%',
            maxWidth: '100vw', // Prevent container from exceeding viewport width
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
                transform: 'translateZ(0)',
                willChange: 'transform',
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
                  display: 'flex', 
                  gap: 2, 
                  overflowX: 'auto',
                  pb: 2,
                  '&::-webkit-scrollbar': {
                    height: '8px',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0, 194, 140, 0.3)',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 194, 140, 0.5)',
                    }
                  }
                }}
              >
                {weekDays.map((day, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: '1 1 0',
                      minWidth: 180, // Slightly wider columns
                      maxWidth: 'calc(100% / 7)',
                      height: '600px',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)', // Very subtle white background
                      borderRadius: '16px',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      position: 'relative',
                      overflow: 'hidden', // Hide overflow
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
                          fontSize: '1.1rem',
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
                          fontSize: '0.9rem',
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
                        p: 2,
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
                      {/* Shift Card - Update the existing shift mapping code */}
                      {combinedShifts
                        .filter(shift => shift.date === format(day, 'yyyy-MM-dd'))
                        .map((shift, idx, arr) => {
                          const pendingRequests = requestedShifts.filter(
                            req => req.availableShiftId === shift.id && req.status === 'pending'
                          );
                          console.log('Pending requests for shift:', shift.id, pendingRequests);
                          const isFromAssigned = Boolean(shift.isFromAssigned);
                          return (
                            <Box key={shift.id} sx={{ width: '100%', mb: idx === arr.length - 1 ? 0 : 2 }}>
                              {/* Main shift card - always green */}
                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: pendingRequests.length > 0 ? '12px 12px 0 0' : '12px',
                                  backgroundColor: isFromAssigned ? '#2196f3' : '#4caf50',
                                  backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                  backdropFilter: 'blur(4px)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  transition: 'all 0.3s ease',
                                  position: 'relative',
                                  minHeight: 70,
                                }}
                              >
                                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                  {shift.start?.substring(0, 5) || '??:??'} - {shift.end?.substring(0, 5) || '??:??'}
                                </Typography>
                                <Box sx={{ position: 'absolute', top: 2, right: 2, display: 'flex', gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    sx={{
                                      color: 'white',
                                      padding: { xs: 0.5, sm: 1 }
                                    }}
                                    onClick={() => handleOpenInfoDialog(shift)}
                                  >
                                    <InfoIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    sx={{
                                      color: 'white',
                                      padding: { xs: 0.5, sm: 1 }
                                    }}
                                    onClick={() => handleOpenEditDialogFromCalendar(shift)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                                {isFromAssigned && (
                                  <Chip 
                                    label="From Assigned" 
                                    size="small" 
                                    sx={{ 
                                      position: 'absolute',
                                      bottom: 4,
                                      right: 4,
                                      fontSize: '0.6rem',
                                      height: 16,
                                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                      color: 'white'
                                    }}
                                  />
                                )}
                              </Box>
                              {/* Render a separate orange bar for each pending request */}
                              {pendingRequests.map((pendingRequest, i) => {
                                const requester = employees.find(emp => emp.id === pendingRequest.employeeId);
                                console.log('Requester for pending request:', employees);
                                return (
                                  <Box
                                    key={pendingRequest.id}
                                    sx={{
                                      width: '100%',
                                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                      borderRadius: i === pendingRequests.length - 1 ? '0 0 12px 12px' : 0,
                                      p: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: 1,
                                      borderTop: '1px solid rgba(255,255,255,0.1)',
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        alert(
                                          `Requested by: ${requester?.name ?? 'Unknown'}\nEmail: ${requester?.email ?? 'Unknown'}`
                                        );
                                      }}
                                      sx={{
                                        color: '#ff9800',
                                        '&:hover': { backgroundColor: 'rgba(255,152,0,0.1)' }
                                      }}
                                    >
                                      <InfoIcon fontSize="small" />
                                    </IconButton>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                      <Button
                                        variant="contained"
                                        size="small"
                                        color="success"
                                        onClick={() => handleAcceptRequest(pendingRequest)}
                                        disabled={loading}
                                        sx={{
                                          minWidth: 0,
                                          px: 1,
                                          py: 0.5,
                                          fontSize: '0.9rem',
                                          background: 'linear-gradient(135deg, rgba(0,194,140,0.1), rgba(0,194,140,0.2))',
                                          border: '1px solid rgba(0,194,140,0.3)',
                                          width: '90px',
                                          height: '30px',
                                        }}
                                      >
                                        Accept
                                      </Button>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        color="error"
                                        onClick={() => handleOpenDenyDialog(pendingRequest.id)}
                                        disabled={loading}
                                        sx={{
                                          minWidth: 0,
                                          px: 1,
                                          py: 0.5,
                                          fontSize: '0.9rem',
                                          borderColor: 'rgba(244,67,54,0.5)',
                                          color: '#f44336',
                                        }}
                                      >
                                        Deny
                                      </Button>
                                    </Box>
                                  </Box>
                                );
                              })}
                            </Box>
                          );
                        })}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* After the calendar grid box but before dialogs */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ color: '#00c28c', mb: 2, fontWeight: 600 }}>
              All Assigned Shifts
            </Typography>
            
            <Box sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              p: 2,
              maxHeight: '300px',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0, 194, 140, 0.2)',
                borderRadius: '4px',
              }
            }}>
              {assignedShifts.length === 0 ? (
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  No assigned shifts found
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {assignedShifts.map(shift => (
                    <Box 
                      key={shift.assigned_id} 
                      sx={{ 
                        backgroundColor: 'rgba(0, 194, 140, 0.1)', 
                        borderRadius: 2,
                        p: 2,
                        border: '1px solid rgba(0, 194, 140, 0.2)',
                        width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33% - 8px)', lg: 'calc(25% - 8px)' },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: '#00c28c' }}>
                          Shift #{shift.assigned_shift_id}
                        </Typography>
                        <Chip 
                          label="Assigned" 
                          size="small" 
                          sx={{ 
                            backgroundColor: 'rgba(0, 194, 140, 0.2)', 
                            color: '#00c28c',
                            fontSize: '0.7rem'
                          }} 
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                        <strong>Date:</strong> {shift.availableShift?.shift_date || 'N/A'}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                        <strong>Time:</strong> {shift.availableShift?.shift_time_start?.substring(0, 5) || 'N/A'} - 
                        {shift.availableShift?.shift_time_end?.substring(0, 5) || 'N/A'}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        <strong>Employee:</strong> {shift.employee?.employee_name || 'Unknown'}
                      </Typography>
                      
                      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteAssignedShift(shift.assigned_id, shift.assigned_shift_id)}
                          sx={{ color: '#f44336' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
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
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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

                {/* Add this new TextField for shift slots */}
                <TextField
                  fullWidth
                  label="Number of Slots"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={newShift.shift_slots_amount || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewShift(prev => ({
                      ...prev,
                      shift_slots_amount: parseInt(value, 10)
                    }));
                  }}
                  sx={{ mt: 2 }}
                />
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

          {/* Deny confirmation dialog */}
          <Dialog open={denyDialogOpen} onClose={handleCancelDeny}>
            <DialogTitle>Are you sure you want to deny?</DialogTitle>
            <DialogActions sx={{ flexDirection: 'column', gap: 1, alignItems: 'stretch', px: 3, pb: 2 }}>
              <Button
                variant="contained"
                color="error"
                onClick={handleConfirmDeny}
                sx={{ mb: 1 }}
              >
                Yes, deny
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancelDeny}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>

          {/* Shift Info Dialog */}
          <Dialog 
            open={infoDialogOpen} 
            onClose={() => setInfoDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Shift Information</DialogTitle>
            <DialogContent>
              {selectedShiftInfo && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Date:</strong> {selectedShiftInfo.date}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Time:</strong> {selectedShiftInfo.start?.substring(0, 5)} - {selectedShiftInfo.end?.substring(0, 5)}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Slots:</strong> {selectedShiftInfo.shift_slots_taken || 0}/{selectedShiftInfo.shift_slots_amount || 'unlimited'}
                  </Typography>
                  
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Assigned Users:
                  </Typography>
                  
                  {(() => {
                    // Try multiple ways to find matching assigned shifts
                    let assignedUsersForThisShift = assignedShifts.filter(assign => 
                      assign.assigned_shift_id === selectedShiftInfo.id
                    );
                    
                    // If no matches found with assigned_shift_id, try with availableShiftId
                    if (assignedUsersForThisShift.length === 0) {
                      assignedUsersForThisShift = assignedShifts.filter(assign => 
                        assign.availableShift === selectedShiftInfo.id
                      );
                    }
                    
                    // If still no matches, try comparing with the availableShift nested object
                    if (assignedUsersForThisShift.length === 0) {
                      assignedUsersForThisShift = assignedShifts.filter(assign => 
                        assign.availableShift && 
                        (assign.availableShift.shift_id === selectedShiftInfo.id || 
                         assign.availableShift.id === selectedShiftInfo.id)
                      );
                    }
                    
                    console.log('Selected shift ID:', selectedShiftInfo.id);
                    console.log('All assigned shifts:', assignedShifts);
                    console.log('Filtered assigned users for this shift:', assignedUsersForThisShift);
                    console.log('All employees:', employees);
                    
                    if (assignedUsersForThisShift.length === 0) {
                      return (
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic' }}>
                          No users assigned to this shift
                        </Typography>
                      );
                    }
                    
                    return assignedUsersForThisShift.map(assign => {
                      // Try multiple ways to find the user
                      let user = employees.find(emp => emp.id === assign.assigned_employee_id);
                      
                      // If not found, try with employeeId
                      if (!user) {
                        user = employees.find(emp => emp.id === assign.employee);
                      }
                      
                      // If still not found, try using the nested employee object
                      if (!user && assign.employee) {
                        user = {
                          id: assign.employee.employee_id || assign.assigned_employee_id,
                          name: assign.employee.employee_name || 'Unknown User',
                          email: assign.employee.employee_email || 'No email'
                        };
                      }
                      
                      console.log('Looking for employee ID:', assign.assigned_employee_id);
                      console.log('Found user:', user);
                      console.log('Assign object:', assign);
                      
                      return (
                        <Box 
                          key={assign.assigned_id} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 1,
                            p: 2,
                            borderRadius: 1,
                            backgroundColor: 'rgba(0, 194, 140, 0.1)',
                            border: '1px solid rgba(0, 194, 140, 0.2)'
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {user?.name || assign.employee?.employee_name || 'Unknown User'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              {user?.email || assign.employee?.employee_email || 'No email'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block' }}>
                              Employee ID: {assign.assigned_employee_id || assign.employee || 'N/A'}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => {
                              handleDeleteAssignedShift(assign.assigned_id, 0); // Pass 0 as placeholder
                            }}
                            sx={{ minWidth: 'auto', px: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </Button>
                        </Box>
                      );
                    });
                  })()}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setInfoDialogOpen(false)}>Close</Button>
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

export default AdminDashboard;