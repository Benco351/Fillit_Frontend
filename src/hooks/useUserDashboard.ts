import { useState, useEffect, useCallback } from 'react';
import { getAvailableShifts, updateAvailableShiftById } from '../utils/apis/availableShiftApis';
import { getRequestedShifts } from '../utils/apis/requestedShiftsApis';
import { getAssignedShifts } from '../utils/apis/assignedShiftApis';
import { AvailableShift, RequestedShift, AssignedShift } from '../components/CalendarFeatures/ShiftUtils';
import { availableShiftsResponse, Employee } from '../components/CalendarFeatures/calendarStates';
import { format, addDays, startOfWeek } from 'date-fns';
// import { request } from 'http';
// import { se } from 'date-fns/locale';

const POLLING_INTERVAL = 10000; // Poll every 10 seconds to reduce data conflicts

export const useUserDashboard = (currentEmployee: Employee) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [availableShifts, setAvailableShifts] = useState<AvailableShift[]>([]);
  const [requestedShifts, setRequestedShifts] = useState<RequestedShift[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [loadingRequested, setLoadingRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<any>('all');
  
  const [assignedShifts, setAssignedShifts] = useState<AssignedShift[]>([]);

  const commonButtonStyle = {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
    color: 'white',
    textTransform: 'none',
    fontWeight: 500,
    letterSpacing: '0.5px',
    padding: '10px 20px',
    borderRadius: '12px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: '12px',
      padding: '2px',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      pointerEvents: 'none',
    },
    '&:hover': {
      transform: 'translateY(-2px) scale(1.02)',
      boxShadow: '0 15px 35px 0 rgba(31, 38, 135, 0.25)',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
      border: '1px solid rgba(255, 255, 255, 0.28)',
    },
    '&:active': {
      transform: 'translateY(1px) scale(0.98)',
      boxShadow: '0 5px 15px 0 rgba(31, 38, 135, 0.15)',
    },
    '&.MuiButton-sizeSmall': {
      padding: '6px 16px',
      fontSize: '0.75rem',
      borderRadius: '8px',
    },
    '&:disabled': {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: 'none',
      color: 'rgba(255, 255, 255, 0.3)',
      transform: 'none',
    }
  };

  const [editShift, setEditShift] = useState<AvailableShift | null>(null); // State for the shift being edited
  
    // State for fetching a shift by ID
  const [shiftIdToFetch, setShiftIdToFetch] = useState<number | ''>('');
  const [fetchedShift, setFetchedShift] = useState<AvailableShift | null>(null);
  
    // Generate week days for the schedule
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  

  const [newShift, setNewShift] = useState<{
    date: string;
    start: string;
    end: string;
    shift_slots_amount: number;
    department_id?: number;
  }>({
    date: format(new Date(), 'yyyy-MM-dd'),
    start: '09:00:00',
    end: '17:00:00',
    shift_slots_amount: 1,
    department_id: undefined,
  });

  
  const [newRequest, setNewRequest] = useState({
        employeeId: currentEmployee.id,
        availableShiftId: 0,
        notes: '',
      });
  
        // Handle prev/next week navigation
  const goToPreviousWeek = () => {
          setCurrentWeekStart(prevWeek => addDays(prevWeek, -7));
        };
      
  const goToNextWeek = () => {
          setCurrentWeekStart(prevWeek => addDays(prevWeek, 7));
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
              });
        
              // console.log('Updated shift response:', updatedShiftResponse);
        
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


    // Dialog states
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState<boolean>(false);
  const [isRequestShiftDialogOpen, setIsRequestShiftDialogOpen] = useState<boolean>(false);
  
  // Use sessionStorage for admin mode
  const adminMode = typeof window !== 'undefined' ? sessionStorage.getItem('isAdmin') : null;
  const isAdmin = adminMode === 'true';

  // Consolidated fetch for all shifts for the current week
  const fetchShiftsForWeek = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (loading) return;
    
    setLoading(true);
    try {
      const startDate = format(currentWeekStart, 'yyyy-MM-dd');
      const endDate = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');

      // Fetch available shifts for the current week
      const availableResponse = await getAvailableShifts({
        shift_start_date: new Date(startDate),
        shift_end_date: new Date(endDate),
      });

      let mappedShifts: any[] = [];
      if (availableResponse?.data && Array.isArray(availableResponse.data)) {
        mappedShifts = availableResponse.data.map((shift: any) => {
          const slotsAmount = Number(shift.shift_slots_amount);
          const slotsTaken = Number(shift.shift_slots_taken);
          
          return {
            id: shift.shift_id || shift.id,
            date: shift.shift_date || shift.date,
            start: shift.shift_time_start || shift.start,
            end: shift.shift_time_end || shift.end,
            shift_slots_amount: isNaN(slotsAmount) ? 1 : slotsAmount,
            shift_slots_taken: isNaN(slotsTaken) ? 0 : slotsTaken,
            department_id: shift.department_id || shift.department?.id,
          };
        });
      }

      // Fetch requested shifts for the current employee
      const requestedResponse = await getRequestedShifts({ request_employee_id: currentEmployee.id }, false);
      if (requestedResponse?.data) {
        setRequestedShifts(requestedResponse.data.map(shift => ({
          id: shift.id,
          employeeId: shift.employeeId,
          availableShiftId: shift.availableShiftId,
          notes: shift.notes || '',
          status: shift.status || 'pending',
          availableShift: shift.availableShift,
          employee: shift.employee
        })));
      }

      // Fetch assigned shifts for the current user only
      // console.log('🔍 Fetching assigned shifts for user:', currentEmployee.id);
      const assignedResponse = await getAssignedShifts({ assigned_employee_id: currentEmployee.id });
      // console.log('🔍 Raw assigned shifts response:', assignedResponse);
      
      let mappedAssignedShifts: any[] = [];
      if (assignedResponse?.data && Array.isArray(assignedResponse.data)) {
        // CLIENT-SIDE FIX: Filter by current user's ID since backend might not be filtering correctly
        const filteredByUser = assignedResponse.data.filter((shift: any) => 
          shift.assigned_employee_id === currentEmployee.id
        );
        // console.log('🔍 Backend returned shifts:', assignedResponse.data);
        // console.log('🔍 Filtered by user ID:', filteredByUser);
        
        mappedAssignedShifts = filteredByUser.map((shift: any) => ({
          id: shift.assigned_id,
          assigned_id: shift.assigned_id,
          employeeId: shift.assigned_employee_id,
          assigned_employee_id: shift.assigned_employee_id,
          availableShiftId: shift.assigned_shift_id,
          assigned_shift_id: shift.assigned_shift_id,
          availableShift: shift.availableShift,
          employee: shift.employee,
        }));
        // console.log('🔍 Mapped assigned shifts:', mappedAssignedShifts);
        setAssignedShifts(mappedAssignedShifts);
      }

      // CRITICAL FIX: Always ensure assigned shifts are included in available shifts
      // This handles cases where assigned shifts are not in available shifts (because they're full)
      if (mappedAssignedShifts.length > 0) {
        // console.log('🔧 USER DASHBOARD FIX: Adding assigned shifts to available shifts');
        
        // Create a map from existing available shifts to avoid duplicates
        const availableShiftMap = new Map();
        
        // Add existing available shifts to the map
        mappedShifts.forEach((shift: any) => {
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
                shift_slots_amount: 1, // Default to 1 slot
                shift_slots_taken: 1, // Since it's assigned, it's taken
                department_id: assignedShift.availableShift.department?.id || null,
              };
              
              availableShiftMap.set(shiftId, availableShift);
              // console.log('➕ ADDED ASSIGNED SHIFT TO AVAILABLE (USER):', availableShift);
            } else {
              // If shift already exists, don't modify the slots taken count
              // The API already provides the correct count
              // console.log('🔄 SHIFT ALREADY EXISTS IN AVAILABLE SHIFTS (USER):', availableShiftMap.get(shiftId));
            }
          }
        });
        
        // Convert map to array and update available shifts
        const finalAvailableShifts = Array.from(availableShiftMap.values());
        setAvailableShifts(finalAvailableShifts);
        // console.log('🎯 FINAL AVAILABLE SHIFTS (USER):', finalAvailableShifts);
      } else {
        setAvailableShifts(mappedShifts);
      }
    } catch (err) {
      //setError('Failed to fetch shifts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart, currentEmployee.id]); // Include currentEmployee.id in dependencies

  // Initial fetch when component mounts or week changes - only for non-admin users
  useEffect(() => {
    if (isAdmin) return; // Disable initial fetch for admin users
    fetchShiftsForWeek();
  }, [fetchShiftsForWeek, isAdmin]);

  // Single polling mechanism for all shifts - only for non-admin users
  useEffect(() => {
    // Disable polling for admin users since AdminDashboard has its own polling
    if (isAdmin) return;
    
    const interval = setInterval(fetchShiftsForWeek, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchShiftsForWeek, isAdmin]);

  // State for edit dialog
  const [isEditShiftDialogOpen, setIsEditShiftDialogOpen] = useState<boolean>(false);
  const [selectedShift, setSelectedShift] = useState<AvailableShift | null>(null);  

  const handleOpenEditDialogFromCalendar = (shift: AvailableShift) => {
    setEditShift(shift); // Set the selected shift for editing
    setIsEditShiftDialogOpen(true); // Open the edit dialog
  };
  
  
    // Utility function to get shift status for display
    const getShiftStatus = (availableShiftId: number): string => {
      const isAssigned = assignedShifts.some(s => s.assigned_shift_id === availableShiftId);
      if (isAssigned) return 'assigned';
      
      const requestedShift = requestedShifts.find(s => s.availableShiftId === availableShiftId);
      if (requestedShift) {
        // If the shift is swapped, treat it as available (user can request again)
        if (requestedShift.status === 'swapped') {
          return 'available';
        }
        return requestedShift.status;
      }
      
      return 'available';
    };

    

  

  return {
    handleOpenEditDialogFromCalendar, commonButtonStyle,
    getShiftStatus,
    currentWeekStart,
    setCurrentWeekStart,
    availableShifts,
    setAvailableShifts,
    requestedShifts,
    loading,
    setLoading,
    error,
    success,
    setSuccess,
    filter,
    setFilter,
    refreshAvailableShifts: fetchShiftsForWeek,
    refreshRequestedShifts: fetchShiftsForWeek,
    setRequestedShifts,
    setError,
    assignedShifts,
    setAssignedShifts,
    newShift,
    setNewShift,
    isAddShiftDialogOpen, setIsAddShiftDialogOpen,
    isRequestShiftDialogOpen, setIsRequestShiftDialogOpen,
    isEditShiftDialogOpen, setIsEditShiftDialogOpen,
    selectedShift, setSelectedShift,
    newRequest, setNewRequest, editShift, setEditShift, shiftIdToFetch, setShiftIdToFetch,
    fetchedShift, setFetchedShift,
    weekDays,
    loadingAvailable,
    loadingRequested, setLoadingAvailable, setLoadingRequested, goToPreviousWeek, goToNextWeek, handleEditShift, fetchShiftsForWeek
  };
};
