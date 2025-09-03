import { api } from './apiconfig';
import {
  CreateAnnouncementDTO,
  UpdateAnnouncementDTO,
  AnnouncementQueryDTO,
} from './types';
import type { AnnouncementMapped } from './types';

/**
 * Creates a new announcement
 */
export const createAnnouncement = async (data: CreateAnnouncementDTO): Promise<any> => {
  try {
    // Backend expects `body` rather than `content`
    const { content, ...rest } = data as any;
    const requestBody = { ...rest, body: content };
    const response = await api.post('/api/announcements', requestBody);
    // Backend returns { status, message, data: { ...announcement } }
    // We return it as-is; consumers typically re-fetch the list afterwards.
    return response.data;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

function mapAnnouncement(item: any): AnnouncementMapped {
  return {
    announcement_id: item.announcement_id ?? item.id,
    title: item.title,
    content: item.content ?? item.body, // backend uses `body`
    start_date: item.start_date,
    updated_at: item.updated_at,
    Employee: item.author
      ? { employee_name: item.author.employee_name }
      : item.Employee ?? undefined,
  };
}

/**
 * Gets all announcements with optional query filters
 */
export const getAnnouncements = async (params: AnnouncementQueryDTO) => {
  try {
    const response = await api.get('/api/announcements', { params });
    const payload = response.data;
    const raw = Array.isArray(payload?.data) ? payload.data : [];
    const mapped: AnnouncementMapped[] = raw.map(mapAnnouncement);
    return { ...payload, data: mapped };
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
};

/**
 * Gets a single announcement by ID
 */
export const getAnnouncementById = async (id: number, organizationId: number) => {
  try {
    const response = await api.get(`/api/announcements/${id}` , { params: { organization_id: organizationId } });
    const payload = response.data;
    const mapped = payload?.data ? mapAnnouncement(payload.data) : undefined;
    return { ...payload, data: mapped };
  } catch (error) {
    console.error('Error fetching announcement by ID:', error);
    throw error;
  }
};

/**
 * Updates an announcement by ID
 */
export const updateAnnouncement = async (id: number, data: UpdateAnnouncementDTO, organizationId: number) => {
  try {
    // Map optional `content` → `body` for backend
    const { content, ...rest } = data as any;
    const requestBody = { ...rest, ...(content !== undefined ? { body: content } : {}), organization_id: organizationId };
    const response = await api.put(`/api/announcements/${id}`, requestBody);
    const payload = response.data;
    const mapped = payload?.data ? mapAnnouncement(payload.data) : undefined;
    return { ...payload, data: mapped };
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};

/**
 * Deletes an announcement by ID
 */
export const deleteAnnouncementById = async (id: number, organizationId: number) => {
  try {
    const response = await api.delete(`/api/announcements/${id}`, { params: { organization_id: organizationId } });
    return response.data; 
  } catch (error) {
    console.error('Error deleting announcement by ID:', error);
    throw error;
  }
};
