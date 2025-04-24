import{ instance } from './apiconfig'; // Adjust the import path as necessary


interface CreateAvailableShiftData {
    date: Date; // format: YYYY-MM-DD
    start: string; // format: HH:mm:ss
    end: string;   // format: HH:mm:ss
}

// Update your interface to match the backend response
interface AvailableShiftResponse {
  shift_id: number; // Note: using shift_id instead of id to match backend
  date: string;
  start: string;
  end: string;
  // Add other fields your backend returns
}

export const createAvailableShift = async (data: CreateAvailableShiftData): Promise<any> => {
  try {
    const response = await instance.post('/available-shifts', data);
    
    if (!response.data) {
      throw new Error('No data returned from the server');
    }

    console.log('createAvailableShift API response:', response.data);
    
    // Return the whole response.data to handle different structures
    return response.data;
  } catch (error) {
    console.error('Error creating available shift:', error);
    throw error;
  }
};

export const getAvailableShiftById = async (id: number ) => {
  try {
    const response = await instance.get(`/available-shifts/${id}`);
    
    if (!response.data.data) {
      throw new Error('No data returned from the server');
    }

    return response.data; // Return the response data
  } catch (error) {
    console.error('Error fetching available shift by ID:', error);
    throw error; // Re-throw the error for further handling
  }
};

interface GetAvailableShiftsParams {
    shift_date?: string; // format: YYYY-MM-DD
    shift_start_after?: string; // format: HH:mm:ss
    shift_end_before?: string; // format: HH:mm:ss
    shift_start_before?: string; // format: HH:mm:ss
    shift_end_after?: string; // format: HH:mm:ss
}
  
export const getAvailableShifts = async (params: GetAvailableShiftsParams = {}) => {
    try {
      const response = await instance.get('/available-shifts', { params });
  
      if (!response.data.data) {
        throw new Error('No data returned from the server');
      }
  
      return response.data; // Return the response data
    } catch (error) {
      console.error('Error fetching available shifts:', error);
      throw error; // Re-throw the error for further handling
    }
};


export const deleteAvailableShiftById = async (id: number) => {
  try {
    const response = await instance.delete(`/available-shifts/${id}`);
    console.log('Delete response:', response.data);
    return response.data; 
  } catch (error) {
    console.error('Error deleting available shift by ID:', error);
    throw error;
  }
};

interface UpdateAvailableShiftData {
    date?: string; // format: YYYY-MM-DD
    start?: string; // format: HH:mm:ss
    end?: string;   // format: HH:mm:ss
}
  
export const updateAvailableShiftById = async (id: number, data: UpdateAvailableShiftData) => {
    try {
      const response = await instance.put(`/available-shifts/${id}`, data);
  
      if (!response.data.data) {
        throw new Error('No data returned from the server');
      }
  
      return response.data; // Return the response data
    } catch (error) {
      console.error('Error updating available shift by ID:', error);
      throw error; // Re-throw the error for further handling
    }
};

interface GetAssignedShiftsParams { 
    assigned_employee_id?: number; // Filter by employee ID (optional)
}

export const getAssignedShifts = async (params: GetAssignedShiftsParams = {}) => {
    try {
        const response = await instance.get('/assigned-shifts', { params });

        if (!response.data.data) {
            throw new Error('No data returned from the server');
        }

        return response.data; // Return the response data
    } catch (error) {
        console.error('Error fetching assigned shifts:', error);
        throw error; // Re-throw the error for further handling
    }
};

// setting button, save changes, cancel, changable date and time (update), delete, + is request shift
// deny button
//accept shift button api