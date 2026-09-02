import { apiClient } from './api';
import type { Project, DashboardStats } from '../types/project';

export interface CreateProjectPayload {
  name: string;
  business_idea: string;
  target_users?: string;
  main_problem?: string;
  expected_features?: string;
  preferred_tech_stack?: string;
  constraints?: string;
}

export const projectApi = {
  getStats: () => apiClient.request<DashboardStats>('/projects/stats'),

  list: (params?: { search?: string; status?: string; stage?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.stage) query.append('stage', params.stage);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.request<Project[]>(`/projects${queryString}`);
  },

  listProjects: (params?: { search?: string; status?: string; stage?: string }) =>
    projectApi.list(params),

  getById: (projectId: string) => apiClient.request<Project>(`/projects/${projectId}`),
  getProject: (projectId: string) => apiClient.request<Project>(`/projects/${projectId}`),

  create: (data: CreateProjectPayload) =>
    apiClient.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createProject: (data: CreateProjectPayload) => projectApi.create(data),

  update: (projectId: string, data: Partial<Project>) =>
    apiClient.request<Project>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateProject: (projectId: string, data: Partial<Project>) =>
    projectApi.update(projectId, data),

  delete: (projectId: string) =>
    apiClient.request<void>(`/projects/${projectId}`, {
      method: 'DELETE',
    }),
  deleteProject: (projectId: string) => projectApi.delete(projectId),
};

