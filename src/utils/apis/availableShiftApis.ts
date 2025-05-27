import { api } from './apiconfig'; // Adjust the import path as necessary
import {
  CreateAvailableShiftDTO,
  UpdateAvailableShiftDTO,
  AvailableShiftQueryDTO,
} from './types'; // Adjust the import path as necessary

export const createAvailableShift = async (data: CreateAvailableShiftDTO): Promise<any> => {
  try {
    const response = await api.post('/api/available-shifts', data);
    
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

export const getAvailableShiftById = async (id: number) => {
  try {
    const response = await api.get(`/api/available-shifts/${id}`);
    
    if (!response.data.data) {
      throw new Error('No data returned from the server');
    }

    return response.data; // Return the response data
  } catch (error) {
    console.error('Error fetching available shift by ID:', error);
    throw error; // Re-throw the error for further handling
  }
};

export const getAvailableShifts = async (params: AvailableShiftQueryDTO = {}) => {
  try {
    const response = await api.get('/api/available-shifts', { params });
  
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
    const response = await api.delete(`/api/available-shifts/${id}`);
    console.log('Delete response:', response.data);
    return response.data; 
  } catch (error) {
    console.error('Error deleting available shift by ID:', error);
    throw error;
  }
};

export const updateAvailableShiftById = async (id: number, data: UpdateAvailableShiftDTO) => {
  try {
    const response = await api.put(`/api/available-shifts/${id}`, data);
  
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
        const response = await api.get('/api/assigned-shifts', { params });

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