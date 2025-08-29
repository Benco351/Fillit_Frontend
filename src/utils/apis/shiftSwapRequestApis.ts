import { api } from './apiconfig';

// Types
export interface ShiftSwapRequest {
  id: number;
  requester_employee_id: number;
  target_employee_id: number;
  requester_shift_id: number;
  target_shift_id: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  response_message?: string;
  created_at?: string;
  updated_at?: string;
}

// 1. Create a Shift Swap Request
export async function createShiftSwapRequest(payload: {
  requester_employee_id: number;
  target_employee_id: number;
  requester_shift_id: number;
  target_shift_id: number;
  message?: string;
}) {
  // Backend expects POST to /api/shift-swap-requests/
  const rawOrgId = sessionStorage.getItem('organizationId');
  const organization_id = rawOrgId && !isNaN(Number(rawOrgId)) ? Number(rawOrgId) : undefined;
  if (organization_id === undefined) throw new Error('Organization ID is not set or invalid');
  const response = await api.post('/api/shift-swap-requests/', { ...payload, organization_id });
  if (response.status !== 201) throw new Error('Failed to create shift swap request');
  return response.data; // Backend returns the created object directly
}

// 2. List Shift Swap Requests
export async function listShiftSwapRequests(employeeId?: number) {
  // Backend expects GET to /api/shift-swap-requests?employee_id=xxx&organization_id=yyy
  const rawOrgId = sessionStorage.getItem('organizationId');
  const organization_id = rawOrgId && !isNaN(Number(rawOrgId)) ? Number(rawOrgId) : undefined;
  if (organization_id === undefined) throw new Error('Organization ID is not set or invalid');
  const params = employeeId ? { employee_id: employeeId, organization_id: organization_id } : { organization_id };
  const response = await api.get('/api/shift-swap-requests', { params });
  if (response.status !== 200) throw new Error('Failed to fetch shift swap requests');
  return response.data; // Backend returns an array of objects
}

// 3. Respond to a Shift Swap Request
export async function respondToShiftSwapRequest(
  id: number,
  payload: { status: 'accepted' | 'rejected' | 'cancelled'; message?: string }
) {
  // Backend expects POST to /api/shift-swap-requests/:id/respond
  const rawOrgId = sessionStorage.getItem('organizationId');
  const organization_id = rawOrgId && !isNaN(Number(rawOrgId)) ? Number(rawOrgId) : undefined;
  if (organization_id === undefined) throw new Error('Organization ID is not set or invalid');
  const response = await api.post(`/api/shift-swap-requests/${id}/respond`, { ...payload, organization_id });
  if (response.status !== 200) throw new Error('Failed to respond to shift swap request');
  return response.data; // Backend returns the updated object
} 