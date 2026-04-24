import client from './client';
import type { Product, Category } from '../types';

export const productsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    featured?: boolean;
  }) => client.get('/products', { params }),

  getById: (id: string) =>
    client.get<{ success: boolean; data: Product }>(`/products/${id}`),

  getCategories: () =>
    client.get<{ success: boolean; data: Category[] }>('/products/categories'),

  create: (data: Partial<Product>) =>
    client.post('/products', data),

  update: (id: string, data: Partial<Product>) =>
    client.put(`/products/${id}`, data),

  delete: (id: string) =>
    client.delete(`/products/${id}`),
};
