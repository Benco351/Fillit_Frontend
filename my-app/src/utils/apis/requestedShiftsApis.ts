import{ instance } from './apiconfig'; // Adjust the import path as necessary

interface CreateRequestedShiftData {
    employeeId: number;
    shiftSlotId: number;
    notes: string;
}
  
export const createRequestedShift = async (data: CreateRequestedShiftData) => {
    try {
      const response = await instance.post('/requested-shifts', data);
  
      if (!response.data.data) {
        throw new Error('No data returned from the server');
      }
  
      return response.data; // Return the response data
    } catch (error) {
      console.error('Error creating requested shift:', error);
      throw error; // Re-throw the error for further handling
    }
};

export const getRequestedShiftById = async (id: number ) => {
    try {
      const response = await instance.get(`/requested-shifts/${id}`);
  
      if (!response.data.data) {
        throw new Error('No data returned from the server');
      }
  
      return response.data; // Return the response data
    } catch (error) {
      console.error('Error fetching requested shift by ID:', error);
      throw error; // Re-throw the error for further handling
    }
};

interface GetRequestedShiftsParams {
    employeeId?: number;      // Filter by employee ID (optional)
    request_status?: string;  // Filter by request status (optional)
}
  
export const getRequestedShifts = async (params: GetRequestedShiftsParams = {}) => {
    try {
      const response = await instance.get('/requested-shifts', { params });
  
      if (!response.data.data) {
        throw new Error('No data returned from the server');
      }
  
      return response.data; // Return the response data
    } catch (error) {
      console.error('Error fetching requested shifts:', error);
      throw error; // Re-throw the error for further handling
    }
};

export const deleteRequestedShiftById = async (id: number ) => {
    try {
      const response = await instance.delete(`/requested-shifts/${id}`);
  
      if (!response.data.data) {
        throw new Error('No data returned from the server');
      }
  
      return response.data; // Return the response data
    } catch (error) {
      console.error('Error deleting requested shift by ID:', error);
      throw error; // Re-throw the error for further handling
    }
};

interface UpdateRequestedShiftData {
    status: string;  // e.g., "denied", "approved"
    notes: string;   // Additional notes for the request
}
  
export const updateRequestedShiftById = async ( id: number , data: UpdateRequestedShiftData ) => {
    try {
      const response = await instance.put(`/requested-shifts/${id}`, data);
  
      if (!response.data.data) {
        throw new Error('No data returned from the server');
      }
  
      return response.data; // Return the response data
    } catch (error) {
      console.error('Error updating requested shift by ID:', error);
      throw error; // Re-throw the error for further handling
    }
};
  
  
  
  