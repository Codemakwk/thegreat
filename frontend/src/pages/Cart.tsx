import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Minus, Plus, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import { cartApi } from '../api/cart';
import { Button } from '../components/ui/Button';
import { LoadingSpinner, EmptyState } from '../components/ui/Shared';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { setItemCount } = useCartStore();
  const [couponCode, setCouponCode] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get(),
    enabled: isAuthenticated,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { cartItemId: string; quantity: number }) => cartApi.updateItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (cartItemId: string) => cartApi.removeItem(cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed from cart');
    },
  });

  const cart = data?.data?.data;

  React.useEffect(() => {
    if (cart) setItemCount(cart.itemCount);
  }, [cart, setItemCount]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <EmptyState
          icon={<ShoppingBag className="w-16 h-16" />}
          title="Sign in to view your cart"
          description="You need to be signed in to add items and manage your cart."
          action={<Link to="/login"><Button>Sign In</Button></Link>}
        />
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <EmptyState
          icon={<ShoppingBag className="w-16 h-16" />}
          title="Your cart is empty"
          description="Looks like you haven't added any items to your cart yet."
          action={<Link to="/products"><Button>Start Shopping</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-8">
        Shopping Cart <span className="text-surface-400 font-normal text-lg">({cart.itemCount} items)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const price = item.variant?.price || item.product.price;
            return (
              <div key={item.id} className="glass-card p-5 flex gap-5">
                <Link to={`/products/${item.productId}`} className="shrink-0">
                  <img
                    src={item.product.images?.[0]?.url || 'https://placehold.co/120x120/1e293b/94a3b8?text=No+Image'}
                    alt={item.product.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link to={`/products/${item.productId}`} className="font-semibold text-surface-900 dark:text-white hover:text-primary-600 transition-colors line-clamp-1">
                        {item.product.name}
                      </Link>
                      {item.variant && (
                        <p className="text-sm text-surface-500 mt-0.5">{item.variant.name}</p>
                      )}
                    </div>
                    <p className="font-bold text-surface-900 dark:text-white whitespace-nowrap">
                      {formatPrice(price * item.quantity)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-surface-200 dark:border-surface-700 rounded-lg">
                      <button
                        onClick={() => updateMutation.mutate({ cartItemId: item.id, quantity: Math.max(0, item.quantity - 1) })}
                        className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-l-lg transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateMutation.mutate({ cartItemId: item.id, quantity: item.quantity + 1 })}
                        className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-r-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeMutation.mutate(item.id)}
                      className="p-2 text-surface-400 hover:text-danger-500 hover:bg-danger-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Order Summary</h3>

            {/* Coupon */}
            <div className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              <Button variant="outline" size="sm">Apply</Button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Subtotal</span>
                <span className="text-surface-900 dark:text-white font-medium">{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Shipping</span>
                <span className="text-surface-900 dark:text-white font-medium">
                  {cart.subtotal > 100 ? (
                    <span className="text-success-500">Free</span>
                  ) : (
                    '$9.99'
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Tax (est.)</span>
                <span className="text-surface-900 dark:text-white font-medium">
                  {formatPrice(cart.subtotal * 0.08)}
                </span>
              </div>
              <hr className="border-surface-200 dark:border-surface-700" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-surface-900 dark:text-white">Total</span>
                <span className="text-surface-900 dark:text-white">
                  {formatPrice(cart.subtotal + (cart.subtotal > 100 ? 0 : 9.99) + cart.subtotal * 0.08)}
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate('/checkout')}
            >
              Checkout <ArrowRight className="w-5 h-5" />
            </Button>

            <Link to="/products" className="block text-center text-sm text-primary-600 dark:text-primary-400 hover:underline mt-4">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
