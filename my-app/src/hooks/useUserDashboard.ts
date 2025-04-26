// src/hooks/useUserDashboard.ts
import { useState } from 'react';
import { startOfWeek } from 'date-fns';
import { AvailableShift, RequestedShift, AssignedShift } from '../components/CalendarFeatures/ShiftUtils';
import { Employee, employees } from '../components/CalendarFeatures/calendarStates';

// Custom hook for managing the User Dashboard state
export const useUserDashboard = () => {
  // State for the current week
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // State for shifts
  const [availableShifts, setAvailableShifts] = useState<AvailableShift[]>([]);
  const [requestedShifts, setRequestedShifts] = useState<RequestedShift[]>([]);
  const [assignedShifts, setAssignedShifts] = useState<AssignedShift[]>([]);

  // Current user (would normally come from auth context)
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(employees[0]);

  // UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog states
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState<boolean>(false);
  const [isRequestShiftDialogOpen, setIsRequestShiftDialogOpen] = useState<boolean>(false);
  const [isEditShiftDialogOpen, setIsEditShiftDialogOpen] = useState<boolean>(false);
  const [selectedShift, setSelectedShift] = useState<AvailableShift | null>(null);

  

  return {
    currentWeekStart,
    availableShifts,
    requestedShifts,
    assignedShifts,
    currentEmployee,
    setCurrentEmployee,
    loading,
    setLoading, // Ensure setLoading is returned
    error,
    success,
    isAddShiftDialogOpen,
    setIsAddShiftDialogOpen,
    isRequestShiftDialogOpen,
    setIsRequestShiftDialogOpen,
    isEditShiftDialogOpen,
    setIsEditShiftDialogOpen,
    selectedShift,
    setSelectedShift,
  };

  
};
