import { api } from './apiconfig'; // Adjust the import path as necessary
import { 
  CreateRequestedShiftDTO, 
  UpdateRequestedShiftDTO, 
  RequestedShiftQueryDTO, 
  RequestedShiftMapped
} from './types'; // Import types from types.ts

interface RequestedShiftResponse {
  request_id: number;
  request_shift_id: number;
  request_employee_id: number;
  request_notes: string | null;
  request_status: 'pending' | 'approved' | 'denied';
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

export const createRequestedShift = async (data: CreateRequestedShiftDTO) => {
  try {
    console.log('Request payload for createRequestedShift:', data); // Log the request payload
    const response = await api.post<{ status: string; message: string; data: RequestedShiftResponse }>('/api/requested-shifts', {
      employeeId: data.employeeId,
      shiftSlotId: data.shiftSlotId,
      notes: data.notes || ''
    });

    if (!response.data?.data) {
      throw new Error('No data returned from the server');
    }

    console.log('Response from createRequestedShift:', response.data); // Log the response
    return {
      id: response.data.data.request_id,
      employeeId: response.data.data.request_employee_id,
      availableShiftId: response.data.data.request_shift_id,
      notes: response.data.data.request_notes || '',
      status: response.data.data.request_status
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating requested shift:', (error as any).response || error.message); // Log detailed error
    } else {
      console.error('Error creating requested shift:', error); // Log generic error
    }
    throw error; // Re-throw the error for further handling
  }
};

export const getRequestedShiftById = async (id: number ) => { //?? 
  try {
    const response = await api.get(`/api/requested-shifts/${id}`);

    if (!response.data.data) {
      throw new Error('No data returned from the server');
    }

    return response.data; // Return the response data
  } catch (error) {
    console.error('Error fetching requested shift by ID:', error);
    throw error; // Re-throw the error for further handling
  }
};

export const getRequestedShifts = async (params: RequestedShiftQueryDTO = {}, isAdmin?: boolean) => {
  try {
    // If admin, fetch all requested shifts (ignore params)
    const apiParams = isAdmin ? {} : {
      request_employee_id: params.request_employee_id,
      request_status: params.request_status
    };
    const response = await api.get<{ status: string; message: string; data: RequestedShiftResponse[] }>(
      '/api/requested-shifts',
      { params: apiParams }
    );

    if (!response.data?.data) {
      throw new Error('No data returned from the server');
    }

    return {
      data: response.data.data.map((shift: any): RequestedShiftMapped => ({
        id: shift.id ?? shift.request_id,
        employeeId: shift.employeeId ?? shift.request_employee_id,
        availableShiftId: shift.availableShiftId ?? shift.request_shift_id,
        notes: shift.notes ?? shift.request_notes ?? '',
        status: shift.status ?? shift.request_status,
        availableShift: shift.availableShift,
        employee: shift.employee
      }))
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching requested shifts:', error.message);
    } else {
      console.error('Error fetching requested shifts:', error);
    }
    throw error;
  }
};



export const deleteRequestedShiftById = async (id: number) => {
  try {
    const response = await api.delete(`/api/requested-shifts/${id}`);

    // Only throw if the overall response is malformed, not if data is null
    if (!response.data || response.data.status !== 'ok') {
      throw new Error('Unexpected server response');
    }

    return response.data; // Still returns { status, message, data: null }
  } catch (error) {
    console.error('Error deleting requested shift by ID:', error);
    throw error;
  }
};


///admin updates requested shift - denies
export const updateRequestedShiftById = async (id: number, data: UpdateRequestedShiftDTO) => {
  try {
    const response = await api.put(`/api/requested-shifts/${id}`, data);

    if (!response.data.data) {
      throw new Error('No data returned from the server');
    }

    return response.data; // Return the response data
  } catch (error) {
    console.error('Error updating requested shift by ID:', error);
    throw error; // Re-throw the error for further handling
  }
};



