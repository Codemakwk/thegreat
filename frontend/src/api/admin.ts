import client from './client';
import type { DashboardStats } from '../types';

export const adminApi = {
  getDashboard: () =>
    client.get<{ success: boolean; data: DashboardStats }>('/admin/dashboard'),

  getOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    client.get('/admin/orders', { params }),

  updateOrderStatus: (id: string, status: string) =>
    client.patch(`/admin/orders/${id}/status`, { status }),

  getUsers: (params?: { page?: number; limit?: number }) =>
    client.get('/admin/users', { params }),

  deleteUser: (id: string) => client.delete(`/admin/users/${id}`),

  toggleBanUser: (id: string) => client.patch(`/admin/users/${id}/ban`),

  getCoupons: () => client.get('/admin/coupons'),

  createCoupon: (data: any) => client.post('/admin/coupons', data),

  updateCoupon: (id: string, data: any) => client.put(`/admin/coupons/${id}`, data),

  deleteCoupon: (id: string) => client.delete(`/admin/coupons/${id}`),

  refundPayment: (orderId: string, amount?: number) =>
    client.post('/payments/refund', { orderId, amount }),
};
