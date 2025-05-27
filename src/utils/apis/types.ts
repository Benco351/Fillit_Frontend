import { z } from 'zod';



export interface RequestedShiftMapped {
    id: number;
    employeeId: number;
    availableShiftId: number;
    notes: string;
    status: 'pending' | 'approved' | 'denied';
    availableShift?: {
    shift_date: string;
    shift_time_start: string;
    shift_time_end: string;
    };
    employee?: {
    employee_name: string;
    employee_email: string;
    };
}
/* ─────────────────────────── Assigned Shift Types ───────────────────────── */
export const CreateAssignedShiftSchema = z.object({
  employeeId:  z.number(),
  shiftSlotId: z.number(),
}).strict();

export const AssignedShiftQuerySchema = z.object({
  assigned_employee_id: z.coerce.number().optional(),
  employee_id:          z.coerce.number().optional(),      // ★ added
}).strict();

export const swapAssignedShiftsSchema = z.object({
  assignedShiftId1: z.coerce.number(),
  assignedShiftId2: z.coerce.number(),
}).strict();

export type SwapAssignedShiftsDTO   = z.infer<typeof swapAssignedShiftsSchema>;
export type CreateAssignedShiftDTO  = z.infer<typeof CreateAssignedShiftSchema>;
export type AssignedShiftQueryDTO  = z.infer<typeof AssignedShiftQuerySchema>;

/* ─────────────────────────── Available Shift Types ──────────────────────── */
/* ---------- Available Shift Types ---------- */
export const CreateAvailableShiftSchema = z.object({
    date: z.coerce.date(),
    start: z.string().time(), 
    end: z.string().time(),
    shift_slots_amount: z.coerce.number().int().min(1).optional(), // Added field
}).strict();

export const UpdateAvailableShiftSchema = z.object({
  date:  z.coerce.date().optional(),
  start: z.string().time().optional(),
  end:   z.string().time().optional(),
}).strict();

export const AvailableShiftQuerySchema = z.object({
  weekStart:         z.string().optional(),               // ★ added (ISO yyyy-MM-dd)
  shift_date:        z.coerce.date().optional(),
  shift_start_before:z.string().time().optional(),
  shift_start_after: z.string().time().optional(),
  shift_end_before:  z.string().time().optional(),
  shift_end_after:   z.string().time().optional(),
  shift_start_date:  z.coerce.date().optional(),
  shift_end_date:    z.coerce.date().optional(),
}).strict();

export type CreateAvailableShiftDTO  = z.infer<typeof CreateAvailableShiftSchema>;
export type UpdateAvailableShiftDTO  = z.infer<typeof UpdateAvailableShiftSchema>;
export type AvailableShiftQueryDTO   = z.infer<typeof AvailableShiftQuerySchema>;

/* ─────────────────────────── Employee Types ─────────────────────────────── */
export const CreateEmployeeSchema = z.object({
  name:     z.string().nonempty(),
  email:    z.string().email(),
  password: z.string().min(1),
  phone:    z.string().optional(),
}).strict();

export const UpdateEmployeeSchema = z.object({
  name:     z.string().nonempty().optional(),
  email:    z.string().email().optional(),
  password: z.string().optional(),
  admin:    z.boolean().optional(),
  phone:    z.string().optional(),
}).strict();

export const EmployeeQuerySchema = z.object({
  employee_admin: z.enum(['true', 'false']).optional(),
}).strict();

export type CreateEmployeeDTO = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployeeDTO = z.infer<typeof UpdateEmployeeSchema>;
export type EmployeeQueryDTO  = z.infer<typeof EmployeeQuerySchema>;

/* ─────────────────────────── Requested Shift Types ─────────────────────── */
export const CreateRequestedShiftSchema = z.object({
  employeeId:  z.number(),
  shiftSlotId: z.number(),
  notes:       z.string().optional(),
}).strict();

export const UpdateRequestedShiftSchema = z.object({
  status: z.enum(['pending', 'approved', 'denied']).optional(),
  notes:  z.string().optional(),
}).strict();

export const RequestedShiftQuerySchema = z.object({
  request_employee_id: z.number().optional(),
  request_status:      z.enum(['pending', 'approved', 'denied']).optional(),
}).strict();

export type CreateRequestedShiftDTO  = z.infer<typeof CreateRequestedShiftSchema>;
export type UpdateRequestedShiftDTO  = z.infer<typeof UpdateRequestedShiftSchema>;
export type RequestedShiftQueryDTO   = z.infer<typeof RequestedShiftQuerySchema>;
