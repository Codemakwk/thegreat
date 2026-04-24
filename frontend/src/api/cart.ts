import client from './client';
import type { Cart } from '../types';

export const cartApi = {
  get: () => client.get<{ success: boolean; data: Cart }>('/cart'),

  addItem: (data: { productId: string; variantId?: string; quantity?: number }) =>
    client.post('/cart/add', data),

  updateItem: (data: { cartItemId: string; quantity: number }) =>
    client.put('/cart/update', data),

  removeItem: (cartItemId: string) =>
    client.delete('/cart/remove', { data: { cartItemId } }),
};
