import{ instance } from './apiconfig'; // Adjust the import path as necessary

interface UpdateEmployeeData {
    name: string;
    email: string;
    password: string;
    admin: boolean;
    phone: string;
}
  
export const updateEmployeeById = async (id: number, data: UpdateEmployeeData) => {
    try {
      const response = await instance.put(`/employees/${id}`, data);
  
      if (!response.data.data) {
        throw new Error('No data returned from the server');
      }
  
      return response.data; // Return the response data
    } catch (error) {
      console.error('Error updating employee by ID:', error);
      throw error; // Re-throw the error for further handling
    }
};

interface GetEmployeesParams {
    employee_admin?: boolean;  // Filter by admin status (optional)
}
  
export const getEmployees = async (params: GetEmployeesParams = {}) => {
    try {
      const response = await instance.get('/employees', { params });
  
      if (!response.data.data) {
        throw new Error('No data returned from the server');
      }
  
      return response.data; // Return the response data
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error; // Re-throw the error for further handling
    }
};

export const getEmployeeById = async (id: number ) => {
    try {
      const response = await instance.get(`/employees/${id}`);
  
      if (!response.data.data) {
        throw new Error('No data returned from the server');
      }
  
      return response.data; // Return the response data
    } catch (error) {
      console.error('Error fetching employee by ID:', error);
      throw error; // Re-throw the error for further handling
    }
  };

interface CreateEmployeeData {
    name: string;
    email: string;
    password: string;
    phone: string;
}
  
export const createEmployee = async (data: CreateEmployeeData) => {
    try {
      const response = await instance.post('/employees', data);
  
      if (!response.data.data) {
        throw new Error('No data returned from the server');
      }
  
      return response.data; // Return the response data
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error; // Re-throw the error for further handling
    }
};


export const deleteEmployeeById = async (id: number ) => {
    try {
      const response = await instance.delete(`/employees/${id}`);
  
      if (!response.data.data) {
        throw new Error('No data returned from the server');
      }
  
      return response.data; // Return the response data
    } catch (error) {
      console.error('Error deleting employee by ID:', error);
      throw error; // Re-throw the error for further handling
    }
};
  
  
  
  