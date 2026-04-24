import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  itemCount: number;
  setItemCount: (count: number) => void;
  incrementCount: (by?: number) => void;
  decrementCount: (by?: number) => void;
  resetCount: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      itemCount: 0,
      setItemCount: (count) => set({ itemCount: count }),
      incrementCount: (by = 1) => set((state) => ({ itemCount: state.itemCount + by })),
      decrementCount: (by = 1) => set((state) => ({ itemCount: Math.max(0, state.itemCount - by) })),
      resetCount: () => set({ itemCount: 0 }),
    }),
    { name: 'thegreat-cart' }
  )
);
