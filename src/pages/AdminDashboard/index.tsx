import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Alert, Snackbar, CircularProgress, CssBaseline, ThemeProvider, MenuItem as DropdownMenuItem,
  Tooltip,
  DialogContentText,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker, DatePicker } from '@mui/x-date-pickers';
import { format, addDays, parseISO, isWithinInterval } from 'date-fns';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Menu as MenuIcon, Info as InfoIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { MainTheme } from '../../assets/themes/themes';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import { ROUTES } from '../../routes/config/routes';
import { createAvailableShift, getAvailableShiftById, deleteAvailableShiftById, updateAvailableShiftById } from '../../utils/apis/availableShiftApis'; // Adjust the import path as necessary
import { createRequestedShift, deleteRequestedShiftById, getRequestedShifts, updateRequestedShiftById } from '../../utils/apis/requestedShiftsApis'; // Import the API functions
import { getAvailableShifts, getAssignedShifts } from '../../utils/apis/availableShiftApis'; // Import the API functions
import { createAssignedShift, deleteAssignedShiftById } from '../../utils/apis/assignedShiftApis';
import { getDepartments } from '../../utils/apis/departmentApis';
//Types
import { AvailableShift, RequestedShift, SelectedShift } from '../../components/CalendarFeatures/ShiftUtils';
import { Employee } from '../../components/CalendarFeatures/calendarStates';
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
import AdminShiftFilter from '../../components/ShiftManagment/AdminShiftFilter';


const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [pendingInfoDialogOpen, setPendingInfoDialogOpen] = useState(false);
  const [selectedPendingRequest, setSelectedPendingRequest] = useState<RequestedShift | null>(null);
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
  const { currentWeekStart, setCurrentWeekStart, availableShifts, setAvailableShifts, requestedShifts, loading, setLoading,
    error, success, filter, setFilter, setSuccess, setError, setRequestedShifts, assignedShifts, setAssignedShifts, newShift,
    setNewShift, isAddShiftDialogOpen, setIsAddShiftDialogOpen, isEditShiftDialogOpen, setIsEditShiftDialogOpen,
    editShift, setEditShift, shiftIdToFetch, setFetchedShift, weekDays, goToNextWeek, goToPreviousWeek
  } = useUserDashboard(currentEmployee);

  // State for deny confirmation dialog
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [denyRequestId, setDenyRequestId] = useState<number | null>(null);

  // Add these state variables at the top with other states   
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedShiftInfo, setSelectedShiftInfo] = useState<SelectedShift>();

  // Employees state
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Departments state
  const [departments, setDepartments] = useState<{ id: number; name: string; address?: string }[]>([]);

  // Department filter state
  const [departmentFilter, setDepartmentFilter] = useState<number | 'all'>('all');

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

  // Navigation functions
  const handleNavigateToShiftInfo = (shiftId: number) => {
    navigate(ROUTES.SHIFT_INFO.replace(':shiftId', shiftId.toString()));
  };

  const handleShiftCardClick = (shift: AvailableShift) => {
    setSelectedShiftInfo(shift);
    setInfoDialogOpen(true);
  };

  // Open info dialog to see shift details
  const handleOpenInfoDialog = (shift: AvailableShift) => {
    // Map the shift to SelectedShift type
    //fetch the shift details by ID if needed
    setSelectedShiftInfo(shift);
    setInfoDialogOpen(true);
  };

  // Fetch all shifts, employees, and departments on mount
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

        // Fetch departments
        const departmentsResponse = await getDepartments();
        if (departmentsResponse?.data && Array.isArray(departmentsResponse.data)) {
          setDepartments(departmentsResponse.data);
        }

        // Fetch available shifts
        let availableShiftsResponse;
        let mappedAvailableShifts: any[] = [];
        
        try {
          availableShiftsResponse = await getAvailableShifts();
          // console.log('Available shifts response:', availableShiftsResponse);
          
          if (availableShiftsResponse?.data && Array.isArray(availableShiftsResponse.data)) {
            mappedAvailableShifts = availableShiftsResponse.data.map((shift: any) => ({
              id: shift.shift_id || shift.id,
              date: shift.shift_date || shift.date,
              start: shift.shift_time_start || shift.start,
              end: shift.shift_time_end || shift.end,
              shift_slots_amount: parseInt(shift.shift_slots_amount, 10) || 1, // Ensure it's parsed as integer with default
              shift_slots_taken: parseInt(shift.shift_slots_taken, 10) || 0, // Ensure it's parsed as integer
              department_id: shift.department_id || shift.department?.id, // Support both flat and nested
            }));
          }
        } catch (error) {
          // console.log('Available shifts API error (this is expected when empty):', error);
          // This is expected when available shifts is empty, continue with empty array
        }

        // Fetch assigned shifts
        const assignedShiftsResponse = await getAssignedShifts();
        let mappedAssignedShifts: any[] = [];
        
        
        if (assignedShiftsResponse?.data && Array.isArray(assignedShiftsResponse.data)) {
          mappedAssignedShifts = assignedShiftsResponse.data.map((shift: any) => ({
            assigned_id: shift.assigned_id,
            assigned_employee_id: shift.assigned_employee_id,
            assigned_shift_id: shift.assigned_shift_id,
            availableShift: shift.availableShift,
            employee: shift.employee,
          }));
          
          // console.log('Mapped assigned shifts:', mappedAssignedShifts);


          // CRITICAL FIX: Always ensure assigned shifts are included in available shifts
          // This handles cases where assigned shifts are not in available shifts (because they're full)

          if (mappedAssignedShifts.length > 0) {
            // console.log('✅ FIX RUNNING: Adding assigned shifts to available shifts');
            
            // Create a map from existing available shifts to avoid duplicates
            const availableShiftMap = new Map();
            
            // Add existing available shifts to the map
            mappedAvailableShifts.forEach((shift: any) => {
              availableShiftMap.set(shift.id, shift);
            });
            
            // Add assigned shifts that are not already in available shifts
            mappedAssignedShifts.forEach((assignedShift: any) => {
              if (assignedShift.availableShift && assignedShift.assigned_shift_id) {
                const shiftId = assignedShift.assigned_shift_id;
                
                if (!availableShiftMap.has(shiftId)) {
                  // Create available shift from assigned shift data
                  const availableShift = {
                    id: shiftId,
                    date: assignedShift.availableShift.shift_date,
                    start: assignedShift.availableShift.shift_time_start,
                    end: assignedShift.availableShift.shift_time_end,
                    shift_slots_amount: assignedShift.availableShift.shift_slots_amount || 1, // Use actual slots amount
                    shift_slots_taken: assignedShift.availableShift.shift_slots_taken || 1, // Use actual slots taken
                    department_id: assignedShift.availableShift.department_id || 
                                  assignedShift.availableShift.department?.department_id || 
                                  null,
                  };
                  
                  availableShiftMap.set(shiftId, availableShift);
                  // console.log('➕ ADDED ASSIGNED SHIFT TO AVAILABLE:', availableShift);
                } else {
                  // If shift already exists, don't modify the slots taken count
                  // The API already provides the correct count
                  // console.log('🔄 SHIFT ALREADY EXISTS IN AVAILABLE SHIFTS (ADMIN INIT):', availableShiftMap.get(shiftId));
                }
              }
            });
            
            // Convert map to array
            mappedAvailableShifts = Array.from(availableShiftMap.values());

          } else {
            // console.log('❌ NO ASSIGNED SHIFTS TO PROCESS');
          }
        }


        
        setAvailableShifts(mappedAvailableShifts);
        setAssignedShifts(mappedAssignedShifts);
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
          shift_slots_amount: parseInt(shift.shift_slots_amount, 10) || 1, // Ensure it's parsed as integer with default
          shift_slots_taken: parseInt(shift.shift_slots_taken, 10) || 0, // Ensure it's parsed as integer
          department_id: shift.department_id || shift.department?.id, // Ensure department_id is present
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


  // Single consolidated polling effect for all dashboard data
  useEffect(() => {
    let isMounted = true;
    let isPolling = false; // Prevent overlapping requests

    const fetchAndUpdateAll = async () => {
      if (isPolling) return; // Skip if already polling
      isPolling = true;

      try {
        const [employeesResponse, availableResponse, requestedResponse, assignedResponse] = await Promise.all([
          getEmployees(),
          getAvailableShifts(),
          getRequestedShifts(),
          getAssignedShifts()
        ]);
        
        if (!isMounted) return;

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
        let mappedAvailableShifts: any[] = [];
        if (availableResponse?.data && Array.isArray(availableResponse.data)) {
          mappedAvailableShifts = availableResponse.data.map((shift: any) => ({
            id: shift.shift_id || shift.id,
            date: shift.shift_date || shift.date,
            start: shift.shift_time_start || shift.start,
            end: shift.shift_time_end || shift.end,
            shift_slots_amount: parseInt(shift.shift_slots_amount, 10) || 1,
            shift_slots_taken: parseInt(shift.shift_slots_taken, 10) || 0,
            department_id: shift.department_id || shift.department?.id,
          }));
        }

        // Requested shifts - use stable update to prevent flickering
        if (requestedResponse?.data && Array.isArray(requestedResponse.data)) {
          const mappedRequestedShifts = requestedResponse.data.map((shift: any) => ({
            id: shift.id,
            employeeId: shift.employeeId,
            availableShiftId: shift.availableShiftId,
            notes: shift.notes || '',
            status: shift.status || 'pending',
          }));

          setRequestedShifts(prevShifts => {
            // More efficient comparison to prevent unnecessary updates
            if (prevShifts.length !== mappedRequestedShifts.length) {
              return mappedRequestedShifts;
            }
            
            // Check if any shift has changed
            const hasChanges = prevShifts.some((prevShift, index) => {
              const newShift = mappedRequestedShifts[index];
              return !newShift || 
                     prevShift.id !== newShift.id ||
                     prevShift.status !== newShift.status ||
                     prevShift.employeeId !== newShift.employeeId ||
                     prevShift.availableShiftId !== newShift.availableShiftId;
            });
            
            return hasChanges ? mappedRequestedShifts : prevShifts;
          });
        }

        // Assigned shifts
        let mappedAssignedShifts: any[] = [];
        if (assignedResponse?.data && Array.isArray(assignedResponse.data)) {
          mappedAssignedShifts = assignedResponse.data.map((shift: any) => ({
            id: shift.assigned_id,
            assigned_id: shift.assigned_id,
            employeeId: shift.assigned_employee_id,
            assigned_employee_id: shift.assigned_employee_id,
            availableShiftId: shift.assigned_shift_id,
            assigned_shift_id: shift.assigned_shift_id,
            availableShift: shift.availableShift,
            employee: shift.employee,
          }));
          

          // CRITICAL FIX: Always ensure assigned shifts are included in available shifts
          // This handles cases where assigned shifts are not in available shifts (because they're full)
          if (mappedAssignedShifts.length > 0) {
            // console.log('Adding assigned shifts to available shifts (polling)');
            
            // Create a map from existing available shifts to avoid duplicates
            const availableShiftMap = new Map();
            
            // Add existing available shifts to the map
            mappedAvailableShifts.forEach((shift: any) => {
              availableShiftMap.set(shift.id, shift);
            });
            
            // Add assigned shifts that are not already in available shifts
            mappedAssignedShifts.forEach((assignedShift: any) => {
              if (assignedShift.availableShift && assignedShift.assigned_shift_id) {
                const shiftId = assignedShift.assigned_shift_id;
                
                if (!availableShiftMap.has(shiftId)) {
                  // Create available shift from assigned shift data
                  const availableShift = {
                    id: shiftId,
                    date: assignedShift.availableShift.shift_date,
                    start: assignedShift.availableShift.shift_time_start,
                    end: assignedShift.availableShift.shift_time_end,
                    shift_slots_amount: assignedShift.availableShift.shift_slots_amount || 1, // Use actual slots amount
                    shift_slots_taken: assignedShift.availableShift.shift_slots_taken || 1, // Use actual slots taken
                    department_id: assignedShift.availableShift.department_id || 
                                  assignedShift.availableShift.department?.department_id || 
                                  null,
                  };
                  
                  availableShiftMap.set(shiftId, availableShift);
                } else {
                  // If shift already exists, don't modify the slots taken count
                  // The API already provides the correct count
                  // console.log('🔄 SHIFT ALREADY EXISTS IN AVAILABLE SHIFTS (ADMIN):', availableShiftMap.get(shiftId));
                }
              }
            });
            
            // Convert map to array
            mappedAvailableShifts = Array.from(availableShiftMap.values());
            // console.log('Final available shifts (polling):', mappedAvailableShifts);
          }
        }

        setAvailableShifts(mappedAvailableShifts);
        setAssignedShifts(mappedAssignedShifts);
      } catch (err) {
        console.error('Error polling dashboard data:', err);
      } finally {
        isPolling = false;
      }
    };

    // Initial fetch
    fetchAndUpdateAll();
    
    // Set up polling interval with a slight delay to prevent immediate overlap
    const interval = setInterval(() => {
      if (isMounted && !isPolling) {
        fetchAndUpdateAll();
      }
    }, POLLING_INTERVAL);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [setAvailableShifts, setRequestedShifts, setAssignedShifts, setEmployees]);

  // Handle adding a new shift
  const handleAddShift = async () => {
    setLoading(true);
    try {
      // console.log('Adding new shift:', newShift);

      const apiResponse = await createAvailableShift({
        date: new Date(newShift.date),
        start: newShift.start,
        end: newShift.end,
        shift_slots_amount: newShift.shift_slots_amount, // Add this line
        department_id: newShift.department_id || undefined, // Pass department_id if selected
      });

      // console.log('API response:', apiResponse);

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
        shift_slots_amount: newShift.shift_slots_amount || 1, // Include the slots amount
        shift_slots_taken: 0, // Initialize to 0
        department_id: newShift.department_id || undefined,
      };

      // Update local state
      setAvailableShifts((prev) => [...prev, addedShift]);

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
      // console.log('Updating shift:', editShift);

      // Call the API to update the shift
      const updatedShiftResponse = await updateAvailableShiftById(editShift.id, {
        date: new Date(editShift.date),
        start: editShift.start,
        end: editShift.end,
        department_id: editShift.department_id || undefined,
      });

      //console.log('Updated shift response:', updatedShiftResponse);

      // Update the local state with the updated shift
      setAvailableShifts((prev) =>
        prev.map((shift) =>
          shift.id === editShift.id
            ? {
                ...shift,
                date: editShift.date,
                start: editShift.start,
                end: editShift.end,
                department_id: editShift.department_id || undefined,
              }
            : shift
        )
      );

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
  const handleDeleteAssignedShift = async (assignedShiftId: number) => {
    setLoading(true);
    try {
      //console.log('Attempting to delete assigned shift:', assignedShiftId);

      if (!assignedShiftId) {
        throw new Error('No shift ID provided');
      }

      // Add validation to check if shift exists in local state
      const shiftExists = assignedShifts.some(shift => shift.assigned_id === assignedShiftId);
      if (!shiftExists) {
        throw new Error(`Assigned shift with ID ${assignedShiftId} not found in local state`);
      }

      await deleteAssignedShiftById(assignedShiftId);
      // Update local state
      setAssignedShifts(prev => prev.filter(shift => shift.assigned_id !== assignedShiftId));

      // Close dialog
      setInfoDialogOpen(false);

      setSuccess('Assigned shift deleted successfully');
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

      //console.log('Requesting shift with payload:', payload); // Log the payload

      // Call the createRequestedShift function to handle the request
      const newRequestResponse = await createRequestedShift(payload);

      //console.log('Requested shift response:', newRequestResponse); // Log the response


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

  const handleDuplicateForMonth = async () => {
    if (!editShift) return;

    setLoading(true);
    try {
      // Get the day of the week from the current shift date
      const currentDate = new Date(editShift.date);
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Calculate the next 3 weeks (including current week = 4 total)
      const duplicatedShifts: AvailableShift[] = [];
      
      for (let weekOffset = 1; weekOffset <= 3; weekOffset++) {
        // Calculate the date for the same day of week in the next weeks
        const targetDate = new Date(currentDate);
        targetDate.setDate(currentDate.getDate() + (weekOffset * 7));
        
        // Create the shift data for this week
        const shiftData = {
          date: targetDate, // Pass Date object instead of string
          start: editShift.start,
          end: editShift.end,
          shift_slots_amount: editShift.shift_slots_amount || 1,
          department_id: editShift.department_id || undefined,
        };

        // Make API call to create the shift
        const apiResponse = await createAvailableShift(shiftData);
        
        // Extract shift ID from response
        let shiftId = null;
        if (apiResponse && apiResponse.shift_id !== undefined) {
          shiftId = apiResponse.shift_id;
        } else if (apiResponse && apiResponse.data && apiResponse.data.shift_id !== undefined) {
          shiftId = apiResponse.data.shift_id;
        }

        if (shiftId) {
          const duplicatedShift: AvailableShift = {
            id: shiftId,
            date: format(targetDate, 'yyyy-MM-dd'),
            start: shiftData.start,
            end: shiftData.end,
            shift_slots_amount: shiftData.shift_slots_amount,
            shift_slots_taken: 0,
            department_id: shiftData.department_id,
          };
          
          duplicatedShifts.push(duplicatedShift);
        }
      }

      // Update local state with all duplicated shifts
      setAvailableShifts((prev) => [...prev, ...duplicatedShifts]);

      setSuccess(`Successfully duplicated shift for the next 3 weeks (${duplicatedShifts.length} shifts created)`);
    } catch (err) {
      console.error('Failed to duplicate shifts:', err);
      setError('Failed to duplicate shifts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDenyRequestedShift = async (requestedShiftId: number) => {
    setLoading(true);
    try {
      //console.log('Denying requested shift with ID:', requestedShiftId);

      // Call the API to update the requested shift status to "denied"
      await updateRequestedShiftById(requestedShiftId, { status: 'denied' });

      // Update local state immediately to prevent flickering
      setRequestedShifts(prev =>
        prev.map(shift =>
          shift.id === requestedShiftId
            ? { ...shift, status: 'denied' }
            : shift
        )
      );

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

      // Then update the request status to approved
      await updateRequestedShiftById(requestedShift.id, { status: 'approved' });

      // Update only the specific request that was approved to prevent unnecessary re-renders
      setRequestedShifts(prev =>
        prev.map(shift =>
          shift.id === requestedShift.id
            ? { ...shift, status: 'approved' }
            : shift
        )
      );

      // Update assigned shifts to include the new assignment
      const assignedEmployee = employees.find(emp => emp.id === requestedShift.employeeId);
      if (assignedEmployee) {
        setAssignedShifts(prev => [...prev, {
          id: Date.now(), // Temporary ID until we get the real one from API
          assigned_id: Date.now(),
          employeeId: requestedShift.employeeId,
          assigned_employee_id: requestedShift.employeeId,
          availableShiftId: requestedShift.availableShiftId,
          assigned_shift_id: requestedShift.availableShiftId,
          availableShift: availableShifts.find(s => s.id === requestedShift.availableShiftId),
          employee: assignedEmployee
        }]);
      }

      // OPTIMIZED: Use a more targeted update to prevent unnecessary re-renders
      // Instead of updating the entire availableShifts array, we'll let the polling handle the update
      // This prevents the animation issue on other pending requests

      setSuccess('Shift assigned successfully');
    } catch (err) {
      console.error('Error assigning shift:', err);
      setError('Failed to assign shift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // #093039 - color for user
  //sidescroll

  // Filtered shifts based on the selected filter and department
  const filteredShifts = React.useMemo(() => {
    // console.log('🔍 FILTERING DEBUG:');
    // console.log('Available shifts for filtering:', availableShifts);
    // console.log('Assigned shifts for filtering:', assignedShifts);
    // console.log('Current employee:', currentEmployee);
    // console.log('Filter:', filter);
    // console.log('Department filter:', departmentFilter);
    
    let shifts = availableShifts;
    
    // CRITICAL FIX: Ensure all assigned shifts are included in the shifts array
    // This handles cases where assigned shifts might not be properly merged
    if (assignedShifts.length > 0) {
      const assignedShiftIds = new Set(shifts.map(s => s.id));
      
      assignedShifts.forEach(assignedShift => {
        if (assignedShift.availableShift && assignedShift.assigned_shift_id && 
            !assignedShiftIds.has(assignedShift.assigned_shift_id)) {
          
          // Create shift from assigned shift data
          const shiftFromAssigned = {
            id: assignedShift.assigned_shift_id,
            date: assignedShift.availableShift.shift_date,
            start: assignedShift.availableShift.shift_time_start,
            end: assignedShift.availableShift.shift_time_end,
            shift_slots_amount: assignedShift.availableShift.shift_slots_amount || 1,
            shift_slots_taken: assignedShift.availableShift.shift_slots_taken || 1,
            department_id: assignedShift.availableShift.department_id || 
                          assignedShift.availableShift.department?.department_id || 
                          null,
          };
          
          shifts.push(shiftFromAssigned);
          // console.log('🔧 ADDED MISSING ASSIGNED SHIFT TO FILTERING:', shiftFromAssigned);
        }
      });
    }
    
    // Apply department filter
    if (departmentFilter !== 'all') {
      shifts = shifts.filter(shift => {
        const matchesDepartment = shift.department_id === departmentFilter;
        // console.log(`Shift ${shift.id} department_id: ${shift.department_id}, filter: ${departmentFilter}, matches: ${matchesDepartment}`);
        return matchesDepartment;
      });
    }
    if (filter === 'full') {
      // Show shifts where slots taken >= slots amount OR where current admin user is assigned
      shifts = shifts.filter(
        shift => {
          const isFull = typeof shift.shift_slots_amount === 'number' &&
            typeof shift.shift_slots_taken === 'number' &&
            shift.shift_slots_taken >= shift.shift_slots_amount;
          
          // Check if current admin user is assigned to this shift
          const isCurrentUserAssigned = assignedShifts.some(
            assignedShift => {
              const shiftIdMatch = assignedShift.assigned_shift_id === shift.id;
              const employeeIdMatch = assignedShift.assigned_employee_id === currentEmployee.id;
              
              return shiftIdMatch && employeeIdMatch;
            }
          );
          
          // Show shift if it's full OR if current user is assigned to it
          return isFull || isCurrentUserAssigned;
        }
      );
    }
    
    // Sort shifts consistently by date, start time, and ID to prevent position jumping
    const sortedShifts = shifts.sort((a, b) => {
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
    
    // console.log('🎯 FINAL FILTERED SHIFTS:', sortedShifts);
    return sortedShifts;
  }, [availableShifts, filter, departmentFilter, assignedShifts, currentEmployee.id]);

  return (
    <ThemeProvider theme={MainTheme}>
      <AIChatPopup />

      <CssBaseline />
      <Box
        sx={{
          backgroundColor: '#18191c !important',
          minHeight: '100vh',
          py: 4,
          px: { xs: 1, sm: 2 }, // Responsive padding
          overflowX: 'hidden', // prevents horizontal scroll
          width: '100%',
          maxWidth: '100vw', // Ensure no overflow
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            px: { xs: 0, sm: 1, md: 2 }, // Reduced padding to prevent overflow
            width: '100%',
            maxWidth: '100%', // Use 100% instead of 100vw to prevent overflow
          }}
        >
          <Navbar />

          {/* Top section layout matching UserDashboard */}
          <Box sx={{ my: 3 }}>
            <UserDashboardTitle title="Admin Management System -" />

            {/* Filters - Matching User Dashboard position */}
            <Box sx={{
              mb: 4,
              display: 'flex',
              justifyContent: 'center',
              gap: 2, // Add gap between filters
              flexWrap: 'wrap',
              alignItems: 'center',
            }}>
              <AdminShiftFilter filter={filter} setFilter={setFilter} />
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
                <DropdownMenuItem value="all" sx={{ color: '#000', background: '#fff' }}>All Departments</DropdownMenuItem>
                {departments.map(dept => (
                  <DropdownMenuItem key={dept.id} value={dept.id} sx={{ color: '#000', background: '#fff' }}>{dept.name}</DropdownMenuItem>
                ))}
              </TextField>
            </Box>

            {/* Frame Box */}
            <Box
              sx={{
                border: '2px solid rgba(0, 194, 140, 0.2)',
                borderRadius: '12px',
                padding: { xs: '16px', sm: '20px', md: '24px' }, // Responsive padding
                backgroundColor: 'secondary.main', // Changed to match UserDashboard's grey
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                mb: 4,
                transform: 'translateZ(0)',
                willChange: 'transform',
                width: '100%',
                maxWidth: '100%', // Prevent overflow
                overflow: 'hidden', // Hide any potential overflow
              }}
            >
              {/* Combined top row for employee selection, navigation, and actions */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: { xs: 2, md: 2 },
                  mb: 3,
                  width: '100%',
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
                    width: { xs: '100%', md: 'auto' }, // Full width on mobile
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
                  flexDirection: { xs: 'column', sm: 'row' }, // Stack vertically on mobile
                  gap: { xs: 1, sm: 2 },
                  width: { xs: '100%', md: 'auto' },
                  alignItems: 'center',
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
                      width: { xs: '100%', sm: 'auto' }, // Full width on mobile
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }, // Smaller text on mobile
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
                      width: { xs: '100%', sm: 'auto' }, // Full width on mobile
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }, // Smaller text on mobile
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
                  flexDirection: { xs: 'column', md: 'row' }, // Stack vertically on mobile, horizontally on desktop
                  gap: 2,
                  width: '100%',
                  overflowX: { xs: 'visible', md: 'visible' }, // Remove horizontal scroll
                  pb: 2,
                }}
              >
                {weekDays.map((day, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: { xs: 'none', md: 1 }, // Don't flex on mobile, flex on desktop
                      minWidth: 0, // Allow shrinking to fit
                      maxWidth: '100%',
                      width: { xs: '100%', md: 'auto' }, // Full width on mobile, auto on desktop
                      height: { xs: 'auto', md: '600px' }, // Auto height on mobile, fixed on desktop
                      minHeight: { xs: '400px', md: '600px' }, // Minimum height for mobile
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
                        p: { xs: 1, sm: 2 }, // Smaller padding on mobile
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
                      {filteredShifts
                        .filter(shift => shift.date === format(day, 'yyyy-MM-dd'))
                        .map((shift, idx, arr) => {
                          const pendingRequests = requestedShifts.filter(
                            req => req.availableShiftId === shift.id && req.status === 'pending'
                          );
                          //console.log('Pending requests for shift:', shift.id, pendingRequests);

                          // Determine if shift is full for visual indication
                          const isShiftFull = shift.shift_slots_amount && shift.shift_slots_taken &&
                            shift.shift_slots_taken >= shift.shift_slots_amount;

                          return (
                            <Box key={shift.id} sx={{ width: '100%', mb: idx === arr.length - 1 ? 0 : 2, minHeight: 110, minWidth: 0 }}>

                              {/* Main shift card */}
                              {isShiftFull ? (
                                <Tooltip
                                  title="Full shift: No more slots available"
                                  placement="top"
                                  enterTouchDelay={0}
                                  leaveTouchDelay={3000}
                                  arrow
                                >
                                  <Box
                                    sx={{
                                      p: 2,
                                      borderRadius: pendingRequests.length > 0 ? '12px 12px 0 0' : '12px',
                                      backgroundColor: isShiftFull ? '#ada8a6' : '#4caf50',
                                      backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                      backdropFilter: 'blur(4px)',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                      border: '1px solid rgba(255,255,255,0.1)',
                                      transition: 'all 0.3s ease',
                                      position: 'relative',
                                      minHeight: 80,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      justifyContent: 'space-between',
                                      willChange: 'transform',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => handleShiftCardClick(shift)}
                                  >
                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                      {shift.start?.substring(0, 5) || '??:??'} - {shift.end?.substring(0, 5) || '??:??'}
                                    </Typography>
                                    {shift.department_id && (
                                      <Typography variant="caption" sx={{ color: '#111', fontWeight: 500 }}>
                                        {departments.find(d => d.id === shift.department_id)?.name || 'Department'}
                                      </Typography>
                                    )}

                                    <Box sx={{ position: 'absolute', top: 2, right: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                      <Tooltip title="Edit Shift">
                                        <IconButton
                                          size="small"
                                          sx={{
                                            color: 'white',
                                            padding: { xs: 0.5, sm: 1 }
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenEditDialogFromCalendar(shift);
                                          }}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Detailed Shift Information">
                                        <IconButton
                                          size="small"
                                          sx={{
                                            color: 'white',
                                            padding: { xs: 0.5, sm: 1 },
                                            mt: -1.7
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation(); // Prevent triggering the card click
                                            handleNavigateToShiftInfo(shift.id);
                                          }}
                                        >
                                          <InfoIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </Box>
                                </Tooltip>
                              ) : (
                                <Box
                                  sx={{
                                    p: 2,
                                    borderRadius: pendingRequests.length > 0 ? '12px 12px 0 0' : '12px',
                                    backgroundColor: isShiftFull ? '#ada8a6' : '#4caf50',
                                    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                    backdropFilter: 'blur(4px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    minHeight: 80,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    willChange: 'transform',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => handleShiftCardClick(shift)}
                                >
                                  <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    {shift.start?.substring(0, 5) || '??:??'} - {shift.end?.substring(0, 5) || '??:??'}
                                  </Typography>
                                  {shift.department_id && (
                                    <Typography variant="caption" sx={{ color: '#111', fontWeight: 500 }}>
                                      {departments.find(d => d.id === shift.department_id)?.name || 'Department'}
                                    </Typography>
                                  )}

                                  <Box sx={{ position: 'absolute', top: 2, right: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Tooltip title="Edit Shift">
                                      <IconButton
                                        size="small"
                                        sx={{
                                          color: 'white',
                                          padding: { xs: 0.5, sm: 1 }
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenEditDialogFromCalendar(shift);
                                        }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Detailed Shift Information">
                                      <IconButton
                                        size="small"
                                        sx={{
                                          color: 'white',
                                          padding: { xs: 0.5, sm: 1 },
                                          mt: -1.7
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent triggering the card click
                                          handleNavigateToShiftInfo(shift.id);
                                        }}
                                      >
                                        <InfoIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                              )}
                              {/* Render pending requests */}
                              {pendingRequests.map((pendingRequest, i) => {
                                const requester = employees.find(emp => emp.id === pendingRequest.employeeId);
                                return (
                                  <Box
                                    key={`pending-${pendingRequest.id}-${pendingRequest.status}-${shift.id}`}
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
                                      // Add transition to prevent jarring animations
                                      transition: 'all 0.2s ease-in-out',
                                    }}
                                  >
                                    <Tooltip title="View Request Details">
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent triggering the card click
                                          setSelectedPendingRequest(pendingRequest);
                                          setPendingInfoDialogOpen(true);
                                        }}
                                        sx={{
                                          color: '#ff9800',
                                          '&:hover': { backgroundColor: 'rgba(255,152,0,0.1)' }
                                        }}
                                      >
                                        <InfoIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                                      <Tooltip title="Accept Request">
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation(); // Prevent triggering the card click
                                            handleAcceptRequest(pendingRequest);
                                          }}
                                          disabled={loading}
                                          sx={{ 
                                            color: 'green',
                                            transition: 'all 0.2s ease-in-out',
                                          }}
                                        >
                                          <CheckIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Deny Request">
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation(); // Prevent triggering the card click
                                            handleOpenDenyDialog(pendingRequest.id);
                                          }}
                                          disabled={loading}
                                          sx={{ 
                                            color: 'red',
                                            transition: 'all 0.2s ease-in-out',
                                          }}
                                        >
                                          <CloseIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
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

                {/* Department Dropdown */}
                <TextField
                  select
                  fullWidth
                  label="Department (optional)"
                  value={newShift.department_id || ''}
                  onChange={e => {
                    const value = e.target.value;
                    setNewShift(prev => ({
                      ...prev,
                      department_id: value ? Number(value) : undefined
                    }));
                  }}
                  sx={{ mt: 2 }}
                >
                  <DropdownMenuItem value="">
                    <em>None</em>
                  </DropdownMenuItem>
                  {departments.map(dept => (
                    <DropdownMenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </DropdownMenuItem>
                  ))}
                </TextField>

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

                  {/* Department Dropdown for Edit */}
                  <TextField
                    select
                    fullWidth
                    label="Department (optional)"
                    value={editShift.department_id || ''}
                    onChange={e => {
                      const value = e.target.value;
                      setEditShift(prev => prev && ({
                        ...prev,
                        department_id: value ? Number(value) : undefined
                      }));
                    }}
                    sx={{ mt: 2 }}
                  >
                    <DropdownMenuItem value="">
                      <em>None</em>
                    </DropdownMenuItem>
                    {departments.map(dept => (
                      <DropdownMenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </DropdownMenuItem>
                    ))}
                  </TextField>
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
                variant="outlined"
                color="primary"
                onClick={handleDuplicateForMonth}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.1), rgba(0, 194, 140, 0.2))',
                  border: '1px solid rgba(0, 194, 140, 0.3)',
                  color: '#00c28c',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.15), rgba(0, 194, 140, 0.25))',
                    border: '1px solid rgba(0, 194, 140, 0.4)',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Duplicate for Month'}
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

          <RequestShiftDialog />

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
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>Shift Information</DialogTitle>
            <DialogContent>
              {selectedShiftInfo && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Assigned Users:
                  </Typography>
                  {(() => {
                    // Find all assigned shifts for this specific shift
                    const shiftAssignments = assignedShifts.filter(assign => 
                      assign.assigned_shift_id === selectedShiftInfo.id
                    );
                    
                    if (shiftAssignments.length === 0) {
                      return (
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                          No users assigned to this shift
                        </Typography>
                      );
                    }
                    
                    return shiftAssignments.map(assign => {
                      // Try multiple ways to find the user
                      const user = employees.find(emp => 
                        emp.id === assign.assigned_employee_id
                      ) || assign.employee;

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
                            {user?.name || user?.employee_name || 'Unknown User'}
                          </Typography>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => {
                              handleDeleteAssignedShift(assign.assigned_id);
                              setInfoDialogOpen(false);
                            }}
                            sx={{ minWidth: 0 }}
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

          {/* Pending Request Info Dialog */}
          <Dialog
            open={pendingInfoDialogOpen}
            onClose={() => {
              setPendingInfoDialogOpen(false);
              setSelectedPendingRequest(null);
            }}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>Request Details</DialogTitle>
            <DialogContent>
              {selectedPendingRequest && (
                <Box sx={{ mt: 1 }}>
                  <DialogContentText>
                    Requested by: {employees.find(emp => emp.id === selectedPendingRequest.employeeId)?.name || 'Unknown'}
                  </DialogContentText>
                  <DialogContentText>
                    Email: {employees.find(emp => emp.id === selectedPendingRequest.employeeId)?.email || 'Unknown'}
                  </DialogContentText>
                  <DialogContentText>
                    Notes: {selectedPendingRequest.notes || 'None'}
                  </DialogContentText>
                  <DialogContentText>
                    Status: {selectedPendingRequest.status}
                  </DialogContentText>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPendingInfoDialogOpen(false)}>Close</Button>
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