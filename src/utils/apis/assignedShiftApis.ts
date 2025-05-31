import { api } from './apiconfig'; // Adjust the import path as necessary
import { AssignedShiftQueryDTO, SwapAssignedShiftsDTO } from './types'; // Import types

export interface CreateAssignedShiftDTO {
  employeeId: number;     // Changed back to camelCase
  shiftSlotId: number;   // Changed back to camelCase
}

//ADMINNNNN - assign shift to myself for admin
// information button - mail and employee - done
//assigned shift - same thing
// see both available and request - add a rectangle under available

export const createAssignedShift = async (data: CreateAssignedShiftDTO) => { // done
    try {
        const response = await api.post('/api/assigned-shifts', data);

        if (!response.data) {
            throw new Error('No data returned from the server');
        }

        console.log('Shift assigned SUCCESS', response.data);
        return response.data; // Return the response data
    } 
    
    catch (error) {
        console.error('Error creating assigned shift:', error);
        throw error; // Re-throw the error for further handling
    }
};

export const deleteAssignedShiftById = async (id: number) => {
    try {
        console.log('Attempting to delete assigned shift with ID:', id);

        if (!id || isNaN(id)) {
            throw new Error('Invalid shift ID provided');
        }

        // Use the route that matches your backend (likely this one)
        const response = await api.delete(`/api/assigned-shifts/${id}`);

        if (response.status === 200 || response.status === 204) {
            return true;
        }
        throw new Error('Failed to delete assigned shift');
    } catch (error: any) {
        console.error('Error in deleteAssignedShiftById:', error.response || error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to delete assigned shift');
    }
};

export const getAssignedShiftById = async (id: number) => { //done
    try {
        const response = await api.get(`/api/assigned-shifts/${id}`);

        if (!response.data.data) {
            throw new Error('No data returned from the server');
        }

        return response.data; // Return the response data
    } catch (error) {
        console.error('Error fetching assigned shift by ID:', error);
        throw error; // Re-throw the error for further handling
    }
};

export const getAssignedShifts = async (params: AssignedShiftQueryDTO = {}) => {
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

export const swapAssignedShift = async (data: SwapAssignedShiftsDTO) => { // done
    try {
        const response = await api.post('/api/assigned-shifts/swap', data);

        if (!response.data.data) {
            throw new Error('No data returned from the server');
        }

        return response.data; // Return the response data
    } catch (error) {
        console.error('Error swapping assigned shifts:', error);
        throw error; // Re-throw the error for further handling
    }
};