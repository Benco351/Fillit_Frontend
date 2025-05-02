import{ instance } from './apiconfig'; // Adjust the import path as necessary

interface CreateRequestedShiftData {
    employeeId: number;
    shiftSlotId: number;
    notes: string;
}

  
export const createRequestedShift = async (data: CreateRequestedShiftData) => {
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

interface GetRequestedShiftsParams { 
    request_employee_id?: number;      // Filter by employee ID (optional)
    request_status?: string;  // Filter by request status (optional)
}

//add
export const getRequestedShifts = async (params: GetRequestedShiftsParams = {}) => {
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
//add - returns to available shift state
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
 
//add - for admin (accept/deny)
//add - for employee (cancel, note)
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



