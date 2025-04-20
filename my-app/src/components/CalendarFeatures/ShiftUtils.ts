export interface AvailableShift {
  id: number;
  date: string;
  start: string;
  end: string;
}

export interface RequestedShift {
  id: number;
  employeeId: number;
  availableShiftId: number;
  notes: string;
  status: 'pending' | 'approved' | 'denied';
}

export interface AssignedShift {
  id: number;
  employeeId: number;
  availableShiftId: number;
}



