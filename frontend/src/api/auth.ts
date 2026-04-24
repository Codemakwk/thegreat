import client from './client';
import type { AuthResponse, User } from '../types';

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    client.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    client.post<{ success: boolean; data: AuthResponse }>('/auth/login', data),

  logout: () => client.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    client.post('/auth/refresh', { refreshToken }),

  forgotPassword: (email: string) =>
    client.post('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; password: string }) =>
    client.post('/auth/reset-password', data),

  verifyEmail: (token: string) =>
    client.get(`/auth/verify-email?token=${token}`),

  getMe: () => client.get<{ success: boolean; data: User }>('/auth/me'),
};
