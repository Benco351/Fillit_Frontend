import { instance } from './apiconfig'; // Adjust the import path as necessary
import { 
  CreateRequestedShiftDTO, 
  UpdateRequestedShiftDTO, 
  RequestedShiftQueryDTO 
} from './types'; // Import types from types.ts

export const createRequestedShift = async (data: CreateRequestedShiftDTO) => {
  try {
    console.log('Request payload for createRequestedShift:', data); // Log the request payload
    const response = await instance.post('/requested-shifts', data); // Ensure this matches the backend endpoint

    if (!response.data || !response.data.data) {
      throw new Error('No data returned from the server');
    }

    console.log('Response from createRequestedShift:', response.data); // Log the response
    return response.data; // Return the response data
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

export const getRequestedShifts = async (params: RequestedShiftQueryDTO = {}) => {
  try {
    // Ensure the params object is correctly formed before sending
    const response = await instance.get('/requested-shifts', { params });

    if (!response.data.data) {
      throw new Error('No data returned from the server');
    }

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching requested shifts:', error.message);
    } else {
      console.error('Error fetching requested shifts:', error);
    }
    throw error;
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

export const updateRequestedShiftById = async (id: number, data: UpdateRequestedShiftDTO) => {
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



