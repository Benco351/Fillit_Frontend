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
  Menu,
  MenuItem as DropdownMenuItem,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker, DatePicker } from '@mui/x-date-pickers';
import { format, startOfWeek, addDays, parseISO, isWithinInterval } from 'date-fns';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Menu as MenuIcon } from '@mui/icons-material';
import { MainTheme } from '../../assets/themes/themes';
import LogoOnly from '../../components/common/Logo';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/dashboardNavbar';
import Footer from '../../components/layout/Footer';
import { intervalToDuration, formatDuration } from 'date-fns';
import { createAvailableShift, getAvailableShiftById, deleteAvailableShiftById, updateAvailableShiftById } from '../../utils/apis/availableShiftApis'; // Adjust the import path as necessary
import { createRequestedShift, getRequestedShifts } from '../../utils/apis/requestedShiftsApis'; // Import the API function
import { getAvailableShifts, getAssignedShifts } from '../../utils/apis/availableShiftApis'; // Import the API functions

//Types
import {AvailableShift, RequestedShift, AssignedShift} from '../../components/CalendarFeatures/ShiftUtils';
import {Employee, availableShiftsResponse, requestedShiftsResponse, assignedShiftsResponse, getShiftColor, calculateDuration} from '../../components/CalendarFeatures/calendarStates';
import {employees} from '../../components/CalendarFeatures/calendarStates';

import { createEmployee } from '../../utils/apis/employeeShiftApis'; 
import { useUserDashboard } from '../../hooks/useUserDashboard';
import ShiftFilters from '../../components/ShiftManagment/ShiftFilters';

const AdminDashboard: React.FC = () => {

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
  const [isEditShiftDialogOpen, setIsEditShiftDialogOpen] = useState<boolean>(false); // State for edit dialog
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

  const [editShift, setEditShift] = useState<AvailableShift | null>(null); // State for the shift being edited

  const [filter, setFilter] = useState<"all" | "requested" | "accepted">("all");

 // Filter state

  // State for fetching a shift by ID
  const [shiftIdToFetch, setShiftIdToFetch] = useState<number | ''>('');
  const [fetchedShift, setFetchedShift] = useState<AvailableShift | null>(null);

  // Generate week days for the schedule
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

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
            id: shift.request_id || shift.id,
            employeeId: shift.employee_id,
            availableShiftId: shift.shift_slot_id,
            notes: shift.notes || '',
            status: shift.status || 'pending',
          }));
          setRequestedShifts(mappedRequestedShifts);
        }

        // Comment out assigned shifts if endpoint is missing or 404
        // const assignedShiftsResponse = await getAssignedShifts();
        // if (assignedShiftsResponse?.data && Array.isArray(assignedShiftsResponse.data)) {
        //   const mappedAssignedShifts = assignedShiftsResponse.data.map((shift: any) => ({
        //     id: shift.assigned_id || shift.id,
        //     employeeId: shift.employee_id,
        //     availableShiftId: shift.shift_slot_id,
        //   }));
        //   setAssignedShifts(mappedAssignedShifts);
        // }
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
            id: shift.request_id || shift.id,
            employeeId: shift.employee_id,
            availableShiftId: shift.shift_slot_id,
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

  // Add a polling interval state
  const POLLING_INTERVAL = 5000; // 5 seconds

  // Fetch requested shifts periodically
  useEffect(() => {
    const fetchRequestedShifts = async () => {
      try {
        const response = await getRequestedShifts();
        console.log('Fetched requested shifts:', response);

        if (response?.data && Array.isArray(response.data)) {
          setRequestedShifts(
            response.data.map((shift: any) => ({
              id: shift.request_id || shift.id,
              employeeId: shift.employee_id,
              availableShiftId: shift.shift_slot_id,
              notes: shift.notes || '',
              status: shift.status || 'pending',
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching requested shifts:', err);
      }
    };

    // Initial fetch
    fetchRequestedShifts();

    // Set up polling
    const interval = setInterval(fetchRequestedShifts, POLLING_INTERVAL);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Add this polling effect to always keep requestedShifts up-to-date
  useEffect(() => {
    const POLLING_INTERVAL = 1500; // 1.5 seconds for faster updates
    let interval: NodeJS.Timeout;

    const pollRequestedShifts = async () => {
      try {
        const response = await getRequestedShifts();
        if (response?.data && Array.isArray(response.data)) {
          setRequestedShifts(
            response.data.map((shift: any) => ({
              id: shift.request_id || shift.id,
              employeeId: shift.employee_id,
              availableShiftId: shift.shift_slot_id,
              notes: shift.notes || '',
              status: shift.status || 'pending',
            }))
          );
        }
      } catch (err) {
        // Optionally handle error
      }
    };

    pollRequestedShifts();
    interval = setInterval(pollRequestedShifts, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Handle prev/next week navigation
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prevWeek => addDays(prevWeek, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prevWeek => addDays(prevWeek, 7));
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigateHome = () => {
    navigate('/home'); // Navigate to the home page
  };

  const handleOpenSettings = () => {
    navigate('/settings'); // Navigate to the settings page
  };

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

  const handleRequestShift = async () => {
    if (!selectedShift) return;
  
    setLoading(true);
    try {
      console.log('Requesting shift:', newRequest);
  
      // Call the API to create a requested shift
      const newRequestResponse = await createRequestedShift({
        employeeId: newRequest.employeeId,
        shiftSlotId: selectedShift.id,
        notes: newRequest.notes,
      });
  
      const newRequestData = newRequestResponse.data; // Ensure you have the correct data structure here
  
      console.log('Requested shift response:', newRequestData);
  
      // Update the local state with the new requested shift
      setRequestedShifts((prev) => [
        ...prev,
        {
          id: newRequestData.id,
          employeeId: newRequest.employeeId,
          availableShiftId: selectedShift.id,
          notes: newRequest.notes,
          status: 'pending',
        },
      ]);
  
      setSuccess('Shift requested successfully');
      setIsRequestShiftDialogOpen(false);
    } catch (err) {
      setError('Failed to request shift. Please try again.');
      if (err instanceof Error) {
        console.error('Error requesting shift:', (err as any)?.response?.data?.message || err.message);
      } else {
        console.error('Error requesting shift:', err);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteShift = async (shiftId: number) => {
    setLoading(true);
    try {
      // Make API call to delete shift
      const response = await deleteAvailableShiftById(shiftId);
      console.log('Deleted shift from server:', response);
  
      // Update local state after successful deletion
      setAvailableShifts(prev => prev.filter(shift => shift.id !== shiftId));
  
      setSuccess('Shift deleted successfully');
    } catch (err) {
      console.error('Failed to delete shift:', err);
      setError('Failed to delete shift. Please try again.');
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
  
      setRequestedShifts((prev) => [
        ...prev,
        {
          id: newRequestResponse.data.id,
          employeeId: currentEmployee.id,
          availableShiftId: editShift.id,
          notes: '',
          status: 'pending',
        },
      ]);
  
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

// Utility function to get shift status for display
const getShiftStatus = (availableShiftId: number): string => {
  // If any user has requested this shift, show its status (pending/approved/denied)
  const requestedShift = requestedShifts.find(s => s.availableShiftId === availableShiftId);
  if (requestedShift) return requestedShift.status;

  // If assigned, show assigned
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

          {/* Navbar with Logo, Home, Settings, and Hamburger Button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            {/* Logo */}
            <LogoOnly />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                onClick={handleNavigateHome}
                sx={{ color: 'white' }}
              >
                Home
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleOpenSettings}
                sx={{ color: 'white' }}
              >
                Settings
              </Button>
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleMenuOpen}
                sx={{ color: 'white' }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <DropdownMenuItem onClick={handleMenuClose}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={handleMenuClose}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={handleMenuClose}>Logout</DropdownMenuItem>
            </Menu>
          </Box>

          <Box sx={{ my: 3 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{
                color: '#4caf50', // Green color for emphasis
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)', // Subtle shadow for depth
                fontFamily: 'Roboto, sans-serif',
                letterSpacing: '0.1em',
                textTransform: 'uppercase', // Make it uppercase for a bold statement
              }}
            >
              Shift Management System
            </Typography>

            {/* Filters */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <ShiftFilters filter={filter} setFilter={setFilter} />
            </Box>

            {/* Employee selection */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
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
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsAddShiftDialogOpen(true)}
              >
                Add Available Shift
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={async () => {
                  try {
                    const response = await createEmployee({
                      name: 'John Doe',
                      email: `john${Math.floor(Math.random() * 10000)}@example.com`, // random email to avoid duplicate
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
              >
                Create Dummy Employee
              </Button>
            </Box>
                    
            {/* Get Shift by ID Section */}
            <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
              <Typography
                variant="h6"
                sx={{ color: 'white', mb: 2 }}
              >
                Get Available Shift by ID
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
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
                  sx={{ minWidth: 120 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Fetch Shift'}
                </Button>
              </Box>
              
              {/* Debug Info - Keep this during development */}
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#333', borderRadius: 1, color: '#0f0' }}>
                <Typography variant="subtitle2" sx={{ color: '#0f0' }}>Debug Information:</Typography>
                <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                  Check browser console for full API response logs
                </Typography>
                {fetchedShift && (
                  <>
                    <Typography variant="caption" sx={{ color: '#0f0' }}>
                      Current fetchedShift state:
                    </Typography>
                    <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: '100px', fontSize: '0.75rem' }}>
                      {JSON.stringify(fetchedShift, null, 2)}
                    </pre>
                  </>
                )}
              </Box>
              
              {/* Fixed Shift Details Display */}
              {fetchedShift ? (
                <Paper sx={{ mt: 2, p: 3, borderRadius: 2, boxShadow: 3 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Shift Details
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      <Typography variant="body1">
                        <strong>Shift ID:</strong> {fetchedShift.id || 'N/A'}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Date:</strong> {fetchedShift.date || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      <Typography variant="body1">
                        <strong>Start Time:</strong> {fetchedShift.start || 'N/A'}
                      </Typography>
                      <Typography variant="body1">
                        <strong>End Time:</strong> {fetchedShift.end || 'N/A'}
                      </Typography>
                    </Box>
                    {fetchedShift.start && fetchedShift.end && (
                      <Typography variant="body1">
                        <strong>Duration:</strong> {calculateDuration(fetchedShift.start, fetchedShift.end)}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              ) : success && !fetchedShift ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No shift found with that ID.
                </Alert>
              ) : null}
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
                      const backgroundColor = status === 'pending' ? 'orange' : getShiftColor(status);
                      
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
                          
                          {/* Edit Button */}
                          <IconButton
                            size="small"
                            sx={{ position: 'absolute', top: 2, right: 2, color: 'white' }}
                            onClick={() => handleOpenEditDialogFromCalendar(shift)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          
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

export default AdminDashboard;