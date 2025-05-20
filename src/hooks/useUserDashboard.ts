import { useState, useEffect, useCallback } from 'react';
import { getAvailableShifts, updateAvailableShiftById } from '../utils/apis/availableShiftApis';
import { getRequestedShifts } from '../utils/apis/requestedShiftsApis';
import { AvailableShift, RequestedShift, AssignedShift } from '../components/CalendarFeatures/ShiftUtils';
import { availableShiftsResponse, Employee } from '../components/CalendarFeatures/calendarStates';
import { format, addDays, startOfWeek } from 'date-fns';
import { request } from 'http';
import { se } from 'date-fns/locale';

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
  const [filter, setFilter] = useState<'all' | 'requested' | 'accepted'>('all');
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


    // Dialog states
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState<boolean>(false);
  const [isRequestShiftDialogOpen, setIsRequestShiftDialogOpen] = useState<boolean>(false);
  const [isEditShiftDialogOpen, setIsEditShiftDialogOpen] = useState<boolean>(false); // State for edit dialog
  const [selectedShift, setSelectedShift] = useState<AvailableShift | null>(null);  

  // Fetch shifts for the current week
  const fetchShiftsForWeek = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = format(currentWeekStart, 'yyyy-MM-dd');
      const endDate = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');

      const response = await getAvailableShifts({
        shift_start_date: new Date(startDate),
        shift_end_date: new Date(endDate),
      });

      console.log('API response for getAvailableShifts:', response);

      if (response?.data && Array.isArray(response.data)) {
        const mappedShifts = response.data.map((shift: any) => ({
          id: shift.shift_id || shift.id,
          date: shift.shift_date || shift.date,
          start: shift.shift_time_start || shift.start,
          end: shift.shift_time_end || shift.end,
        }));

        setAvailableShifts(mappedShifts);
      } else {
        setAvailableShifts([]);
      }
    } catch (err) {
      //setError('Failed to fetch shifts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart]); // Only depend on currentWeekStart

  useEffect(() => {
    fetchShiftsForWeek();
  }, [fetchShiftsForWeek]);

  
  const fetchRequestedShifts = useCallback(async () => {
    setLoadingRequested(true);
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

          // Preserve existing pending requests
          return prevRequests.map(prev => {
            const newReq = newRequests.find(nr => nr.availableShiftId === prev.availableShiftId);
            return (prev.status === 'pending' && !newReq) ? prev : (newReq || prev);
          });
        });
      }
    } catch (err) {
      //setError('Failed to fetch requested shifts');
    } finally {
      setLoadingRequested(false);
    }
  }, [currentEmployee.id]);

  useEffect(() => {
    fetchRequestedShifts();
  }, [fetchRequestedShifts]);

  // Update the polling effect to better preserve pending status
  useEffect(() => {
    let ignoreStaleRequest = false;
    const pollInterval = setInterval(async () => {
      try {
        const params = { request_employee_id: currentEmployee.id };
        const response = await getRequestedShifts(params);
        
        if (!ignoreStaleRequest && response?.data) {
          setRequestedShifts(prevRequests => {
            const newRequests = response.data.map(shift => ({
              id: shift.id,
              request_shift_id: shift.id,
              employeeId: shift.employeeId,
              availableShiftId: shift.availableShiftId,
              notes: shift.notes || '',
              status: shift.status || 'pending'
            }));

            // Keep existing pending requests and merge with new data
            return prevRequests.map(existingReq => {
              const newReq = newRequests.find(
                req => req.availableShiftId === existingReq.availableShiftId
              );
              // Preserve pending status unless server explicitly changes it
              if (existingReq.status === 'pending' && (!newReq || newReq.status === 'pending')) {
                return existingReq;
              }
              return newReq || existingReq;
            });
          });
        }
      } catch (error) {
        console.error('Error polling shifts:', error);
      }
    }, 10000); // Increased to 10 seconds to reduce update frequency

    return () => {
      ignoreStaleRequest = true;
      clearInterval(pollInterval);
    };
  }, [currentEmployee.id]);

    const handleOpenEditDialogFromCalendar = (shift: AvailableShift) => {
      setEditShift(shift); // Set the selected shift for editing
      setIsEditShiftDialogOpen(true); // Open the edit dialog
    };
  
  
    // Utility function to get shift status for display
    const getShiftStatus = (availableShiftId: number): string => {
      const isAssigned = assignedShifts.some(s => s.availableShiftId === availableShiftId);
      if (isAssigned) return 'assigned';
      
      const requestedShift = requestedShifts.find(s => s.availableShiftId === availableShiftId);
      if (requestedShift) return requestedShift.status;
      
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
    refreshRequestedShifts: fetchRequestedShifts,
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