import { api } from './apiconfig';
import {
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  DepartmentQueryDTO,
} from './types';

// Helper to map backend department to frontend shape
function mapDepartment(dept: any) {
  return {
    id: dept.department_id,
    name: dept.department_name,
    address: dept.department_address,
  };
}

// Get all departments (with optional query)
export const getDepartments = async (params: Partial<DepartmentQueryDTO> = {}) => {
  try {
    const response = await api.get('/api/departments', { params });
    if (!response.data || !Array.isArray(response.data.data)) {
      throw new Error('No data returned from the server');
    }
    return {
      ...response.data,
      data: response.data.data.map(mapDepartment),
    };
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

// Get a department by ID
export const getDepartmentById = async (id: number) => {
  try {
    const response = await api.get(`/api/departments/${id}`);
    if (!response.data || !response.data.data) {
      throw new Error('No data returned from the server');
    }
    return {
      ...response.data,
      data: mapDepartment(response.data.data),
    };
  } catch (error) {
    console.error('Error fetching department by ID:', error);
    throw error;
  }
};

// Create a new department
export const createDepartment = async (data: Omit<CreateDepartmentDTO, 'organization_id'>) => {
  try {
    const response = await api.post('/api/departments', data);
    if (!response.data || !response.data.data) {
      throw new Error('No data returned from the server');
    }
    return {
      ...response.data,
      data: mapDepartment(response.data.data),
    };
  } catch (error) {
    console.error('Error creating department:', error);
    throw error;
  }
};

// Update a department
export const updateDepartment = async (id: number, data: UpdateDepartmentDTO) => {
  try {
    const response = await api.put(`/api/departments/${id}`, data);
    if (!response.data || !response.data.data) {
      throw new Error('No data returned from the server');
    }
    return {
      ...response.data,
      data: mapDepartment(response.data.data),
    };
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

// Delete a department
export const deleteDepartment = async (id: number) => {
  try {
    const response = await api.delete(`/api/departments/${id}`);
    if (response.status === 200 || response.status === 204) {
      return true;
    }
    throw new Error('Failed to delete department');
  } catch (error: any) {
    console.error('Error deleting department:', error.response || error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete department');
  }
}; 