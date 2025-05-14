import { instance } from './apiconfig'; // Adjust the import path as necessary
import { CreateAssignedShiftDTO, AssignedShiftQueryDTO, SwapAssignedShiftsDTO } from './types'; // Import types

//ADMINNNNN - assign shift to myself for admin
// information button - mail and employee
//assigned shift - same thing
// see both available and request - add a rectangle under available

export const createAssignedShift = async (data: CreateAssignedShiftDTO) => { // done
    try {
        const response = await instance.post('/assigned-shifts', data);

        if (!response.data.data) {
            throw new Error('No data returned from the server');
        }

        console.log('Shift assinged SUCCESS', response.data);
        return response.data; // Return the response data
    } 
    
    catch (error) {
        console.error('Error creating assigned shift:', error);
        throw error; // Re-throw the error for further handling
    }
};

export const deleteAssignedShiftById = async (id: number) => {
    try {
        const response = await instance.delete(`/assigned-shifts/${id}`);

        if (!response.data.data) {
            throw new Error('No data returned from the server');
        }

        return response.data; // Return the response data
    } catch (error) {
        console.error('Error deleting assigned shift by ID:', error);
        throw error; // Re-throw the error for further handling
    }
};

export const getAssignedShiftById = async (id: number) => { //done
    try {
        const response = await instance.get(`/assigned-shifts/${id}`);

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

export const swapAssignedShift = async (data: SwapAssignedShiftsDTO) => { // done
    try {
        const response = await instance.post('/assigned-shifts/swap', data);

        if (!response.data.data) {
            throw new Error('No data returned from the server');
        }

        return response.data; // Return the response data
    } catch (error) {
        console.error('Error swapping assigned shifts:', error);
        throw error; // Re-throw the error for further handling
    }
};

