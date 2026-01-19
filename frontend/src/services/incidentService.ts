import { apiClient } from './api';
import { Incident, CreateIncidentRequest, PaginatedResponse } from '@/types';

/**
 * Incident service - handles all incident-related API calls
 */
export const incidentService = {
  /**
   * Create a new incident
   */
  async create(data: CreateIncidentRequest): Promise<Incident> {
    const response = await apiClient.post<Incident>('/incidents', data);
    return response.data;
  },

  /**
   * Get all incidents for the current user
   */
  async getAll(page = 0, size = 20): Promise<PaginatedResponse<Incident> | Incident[]> {
    const response = await apiClient.get<PaginatedResponse<Incident> | Incident[]>('/incidents', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Get a single incident by ID
   */
  async getById(id: string): Promise<Incident> {
    const response = await apiClient.get<Incident>(`/incidents/${id}`);
    return response.data;
  },

  /**
   * Update an incident
   */
  async update(id: string, data: Partial<CreateIncidentRequest>): Promise<Incident> {
    const response = await apiClient.put<Incident>(`/incidents/${id}`, data);
    return response.data;
  },

  /**
   * Delete an incident
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/incidents/${id}`);
  },

  /**
   * Trigger analysis for an incident
   */
  async analyze(id: string): Promise<Incident> {
    const response = await apiClient.post<Incident>(`/incidents/${id}/analyze`);
    return response.data;
  },
};
