import { format, addDays } from 'date-fns';
import { getAvailableShifts } from '../utils/apis/availableShiftApis'; // Adjust path as needed
import { AvailableShift } from '../components/CalendarFeatures/ShiftUtils';

export const fetchShiftsForWeek = async (
  currentWeekStart: Date,
  setAvailableShifts: (shifts: AvailableShift[]) => void,
  setLoading: (loading: boolean) => void,
  setError: (err: string | null) => void
) => {
  setLoading(true);
  try {
    const startDate = format(currentWeekStart, 'yyyy-MM-dd');
    const endDate = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');

    const response = await getAvailableShifts({
      shift_start_date: new Date(startDate),
      shift_end_date: new Date(endDate),
    });

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
    console.error('Error fetching shifts for the week:', err);
    setError('Failed to fetch shifts. Please try again later.');
  } finally {
    setLoading(false);
  }
};
