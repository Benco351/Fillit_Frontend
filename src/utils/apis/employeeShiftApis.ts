import { Employee } from '../../components/CalendarFeatures/calendarStates';
import { api } from './apiconfig'; // Adjust the import path as necessary
import { CreateEmployeeDTO, UpdateEmployeeDTO, EmployeeQueryDTO } from './types'; // Import types

export const updateEmployeeById = async (id: number, data: UpdateEmployeeDTO) => {
    try {
        const response = await api.put(`/api/employees/${id}`, data);

        if (!response.data.data) {
            throw new Error('No data returned from the server');
        }

        return response.data; // Return the response data
    } catch (error) {
        console.error('Error updating employee by ID:', error);
        throw error; // Re-throw the error for further handling
    }
};

export const getEmployees = async (params: EmployeeQueryDTO = {}) => {
    try {
        const response = await api.get('/api/employees', { params });

        if (!response.data.data) {
            throw new Error('No data returned from the server');
        }

        return response.data; // Return the response data
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw error; // Re-throw the error for further handling
    }
};

export const getEmployeeById = async (id: number) => {
    try {
        const response = await api.get(`/api/employees/${id}`);

        if (!response.data.data) {
            throw new Error('No data returned from the server');
        }

        return response.data; // Return the response data
    } catch (error) {
        console.error('Error fetching employee by ID:', error);
        throw error; // Re-throw the error for further handling
    }
};

export const createEmployee = async (data: CreateEmployeeDTO) => {
    try {
        const response = await api.post('/api/employees', data);

        if (!response.data.data) {
            throw new Error('No data returned from the server');
        }

        return response.data; // Return the response data
    } catch (error) {
        console.error('Error creating employee:', error);
        throw error; // Re-throw the error for further handling
    }
};

export const deleteEmployeeById = async (id: number) => {
    try {
        const response = await api.delete(`/api/employees/${id}`);

        if (!response.data.data) {
            throw new Error('No data returned from the server');
        }

        return response.data; // Return the response data
    } catch (error) {
        console.error('Error deleting employee by ID:', error);
        throw error; // Re-throw the error for further handling
    }
};



