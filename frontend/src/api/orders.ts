import client from './client';
import type { Order, Address } from '../types';

export const ordersApi = {
  checkout: (data: { shippingAddressId: string; couponCode?: string; notes?: string }) =>
    client.post('/orders/checkout', data),

  getAll: () => client.get<{ success: boolean; data: Order[] }>('/orders'),

  getById: (id: string) =>
    client.get<{ success: boolean; data: Order }>(`/orders/${id}`),
};

export const addressApi = {
  getAll: () => client.get<{ success: boolean; data: Address[] }>('/addresses'),

  create: (data: Omit<Address, 'id'>) =>
    client.post('/addresses', data),

  update: (id: string, data: Partial<Address>) =>
    client.put(`/addresses/${id}`, data),

  delete: (id: string) => client.delete(`/addresses/${id}`),
};

export const reviewsApi = {
  getByProduct: (productId: string, params?: { page?: number; limit?: number }) =>
    client.get(`/reviews/product/${productId}`, { params }),

  create: (data: { productId: string; rating: number; title?: string; comment?: string }) =>
    client.post('/reviews', data),
};

export const paymentsApi = {
  createIntent: (orderId: string) =>
    client.post('/payments/create-intent', { orderId }),
};
