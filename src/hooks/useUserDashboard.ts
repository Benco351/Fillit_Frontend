import { useState, useEffect, useCallback } from 'react';
import { getAvailableShifts } from '../utils/apis/availableShiftApis';
import { getRequestedShifts } from '../utils/apis/requestedShiftsApis';
import { AvailableShift, RequestedShift, AssignedShift } from '../components/CalendarFeatures/ShiftUtils';
import { Employee } from '../components/CalendarFeatures/calendarStates';
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
      


    // Dialog states
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState<boolean>(false);
  const [isRequestShiftDialogOpen, setIsRequestShiftDialogOpen] = useState<boolean>(false);
  const [isEditShiftDialogOpen, setIsEditShiftDialogOpen] = useState<boolean>(false); // State for edit dialog
  const [selectedShift, setSelectedShift] = useState<AvailableShift | null>(null);  

  const fetchShiftsForWeek = useCallback(async () => {
    setLoadingAvailable(true);
    setError(null);
    try {
      const startDate = currentWeekStart;
      const endDate = addDays(currentWeekStart, 6);
      const response = await getAvailableShifts({ shift_start_date: startDate, shift_end_date: endDate });
      if (response?.data && Array.isArray(response.data)) {
        setAvailableShifts(response.data.map((shift: any) => ({
          id: shift.shift_id || shift.id,
          date: shift.shift_date || shift.date,
          start: shift.shift_time_start || shift.start,
          end: shift.shift_time_end || shift.end,
        })));
      } else {
        setAvailableShifts([]);
      }
    } catch (err) {
      setError('Failed to fetch shifts. Please try again later.');
    } finally {
      setLoadingAvailable(false);
    }
  }, [currentWeekStart]);

  const fetchRequestedShifts = useCallback(async () => {
    setLoadingRequested(true);
    setError(null);
    try {
      const response = await getRequestedShifts({ request_employee_id: currentEmployee.id });
      if (response?.data && Array.isArray(response.data)) {
        setRequestedShifts(response.data.map((shift: any) => ({
          id: shift.request_id || shift.id,
          employeeId: shift.employee_id,
          availableShiftId: shift.shift_slot_id,
          notes: shift.notes || '',
          status: shift.status || 'pending',
        })));
      }
    } catch (err) {
      setError('Failed to fetch requested shifts. Please try again later.');
    } finally {
      setLoadingRequested(false);
    }
  }, [currentEmployee.id]);

  useEffect(() => {
    fetchShiftsForWeek();
  }, [fetchShiftsForWeek]);

  useEffect(() => {
    fetchRequestedShifts();
  }, [fetchRequestedShifts]);

  

  return {
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
    loadingRequested, setLoadingAvailable, setLoadingRequested, goToPreviousWeek, goToNextWeek
  };
};
