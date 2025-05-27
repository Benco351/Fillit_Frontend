/* --------------------------------------------------------------------------
   Canonical shift-related models used across the dashboard and APIs.
   -------------------------------------------------------------------------- */

export interface Employee {
  id: number;
  name: string;
  email?: string;          // optional for cases where it is not returned
}

export interface AvailableShift {
  id: number;
  date: string;
  start: string;
  end: string;
  shift_slots_amount?: number;
  shift_slots_taken?: number;

}

export interface RequestedShift {
  request_shift_id: number;      // server PK
  id: number;                    // client PK (mirrors request_shift_id)
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
