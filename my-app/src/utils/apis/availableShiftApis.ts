import{ instance } from './apiconfig'; // Adjust the import path as necessary


interface CreateAvailableShiftData {
    date: Date; // format: YYYY-MM-DD
    start: string; // format: HH:mm:ss
    end: string;   // format: HH:mm:ss
}
export const createAvailableShift = async (data: CreateAvailableShiftData) => {
    try {
      const response = await instance.post('/available-shifts', data);
      
      if (!response.data.data) {
        throw new Error('No data returned from the server');}

      return response.data; // Return the response data //body
    } catch (error) {
      console.error('Error creating available shift:', error);
      throw error; // Re-throw the error for further handling
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


export const deleteAvailableShiftById = async (id: number ) => {
    try {
      const response = await instance.delete(`/available-shifts/${id}`);
  
      if (!response.data.data) {
        throw new Error('No data returned from the server');
      }
  
      return response.data; // Return the response data
    } catch (error) {
      console.error('Error deleting available shift by ID:', error);
      throw error; // Re-throw the error for further handling
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
  