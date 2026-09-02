import { apiClient } from './api';
import type { User, TokenResponse } from '../types/auth';

export const authApi = {
  register: (data: { full_name: string; email: string; password: string; confirm_password: string }) =>
    apiClient.request<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiClient.request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCurrentUser: () => apiClient.request<User>('/auth/me'),

  logout: (refreshToken: string) =>
    apiClient.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
};
