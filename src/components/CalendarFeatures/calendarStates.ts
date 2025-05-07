// Helper function to calculate duration between two time strings (HH:MM:SS format)
export const calculateDuration = (startTime: string, endTime: string): string => {
  try {
    // Parse hours, minutes from time strings
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    // Convert to minutes
    let startTotalMinutes = startHours * 60 + startMinutes;
    let endTotalMinutes = endHours * 60 + endMinutes;
    
    // Handle case where end time is on the next day
    if (endTotalMinutes < startTotalMinutes) {
      endTotalMinutes += 24 * 60; // Add a day
    }
    
    // Calculate difference in minutes
    const diffMinutes = endTotalMinutes - startTotalMinutes;
    
    // Convert back to hours and minutes
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    // Format the result
    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes > 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''}` : ''}`;
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 'Unknown duration';
  }
};
    
export interface Employee {
    id: number;
    name: string;
  }

export const employees: Employee[] = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Bob Johnson' },
];

      // Simulated API response
export const availableShiftsResponse = [
        { id: 1, date: '2023-10-02', start: '09:00:00', end: '13:00:00' },
        { id: 2, date: '2023-10-02', start: '13:00:00', end: '17:00:00' },
        { id: 3, date: '2023-10-03', start: '09:00:00', end: '17:00:00' },
        { id: 4, date: '2023-10-04', start: '10:00:00', end: '14:00:00' },
        { id: 5, date: '2023-10-05', start: '12:00:00', end: '16:00:00' },
      ];
      
export const requestedShiftsResponse = [
        { id: 1, employeeId: 1, availableShiftId: 1, notes: 'I can work this shift', status: 'pending' },
        { id: 2, employeeId: 2, availableShiftId: 2, notes: 'Available for this shift', status: 'approved' },
        { id: 3, employeeId: 3, availableShiftId: 3, notes: 'Can I take this shift?', status: 'denied' },
      ];
      
export const assignedShiftsResponse = [
        { id: 1, employeeId: 2, availableShiftId: 2 },
        { id: 2, employeeId: 1, availableShiftId: 5 },
      ];

export const getShiftColor = (status: string): string => {
  switch (status) {
    case 'available':
      return '#4caf50'; // Green
    case 'pending':
      return '#ff9800'; // Orange
    case 'assigned':
      return '#2196f3'; // Blue
    case 'denied':
      return '#f44336'; // Red
    default:
      return '#757575'; // Grey
  }
};



