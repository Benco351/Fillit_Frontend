import{ instance } from './apiconfig'; // Adjust the import path as necessary

interface CreateAssignedShiftData {
    employeeId: number;
    shiftSlotId: number;
}
 ///ADMINNNNN - assign shift to myself for admin
export const createAssignedShift = async (data: CreateAssignedShiftData) => { // done
    try {
      const response = await instance.post('/assigned-shifts', data);
  
      if (!response.data.data) {
        throw new Error('No data returned from the server');
      }
  
      return response.data; // Return the response data
    } catch (error) {
      console.error('Error creating assigned shift:', error);
      throw error; // Re-throw the error for further handling
    }
};


export const deleteAssignedShiftById = async (id: number ) => { 
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

export const getAssignedShiftById = async (id: number ) => { //done
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
  

  


  
  