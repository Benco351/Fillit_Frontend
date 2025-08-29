import { api } from './apiconfig';
import {
  CreateAnnouncementDTO,
  UpdateAnnouncementDTO,
  AnnouncementQueryDTO,
} from './types';

/**
 * Creates a new announcement
 */
export const createAnnouncement = async (data: CreateAnnouncementDTO): Promise<any> => {
  try {
    const response = await api.post('/api/announcements', data);
    return response.data;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

/**
 * Gets all announcements with optional query filters
 */
export const getAnnouncements = async (params: AnnouncementQueryDTO = {}) => {
  try {
    const response = await api.get('/api/announcements', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
};

/**
 * Gets a single announcement by ID
 */
export const getAnnouncementById = async (id: number) => {
  try {
    const response = await api.get(`/api/announcements/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching announcement by ID:', error);
    throw error;
  }
};

/**
 * Updates an announcement by ID
 */
export const updateAnnouncement = async (id: number, data: UpdateAnnouncementDTO) => {
  try {
    const response = await api.put(`/api/announcements/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};

/**
 * Deletes an announcement by ID
 */
export const deleteAnnouncementById = async (id: number) => {
  try {
    const response = await api.delete(`/api/announcements/${id}`);
    return response.data; 
  } catch (error) {
    console.error('Error deleting announcement by ID:', error);
    throw error;
  }
};
