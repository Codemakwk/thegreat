import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronRight, Eye, Download } from 'lucide-react';
import { ordersApi } from '../api/orders';
import { Button } from '../components/ui/Button';
import { Badge, LoadingSpinner, EmptyState } from '../components/ui/Shared';
import { formatPrice, formatDate, getStatusColor } from '../utils/helpers';
import type { Order } from '../types';

const statusVariantMap: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning',
  PROCESSING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'default',
};

export const OrderHistory: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getAll(),
  });

  const orders: Order[] = data?.data?.data || [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-8">Order History</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Package className="w-16 h-16" />}
          title="No orders yet"
          description="Once you place your first order, it will appear here."
          action={<Link to="/products"><Button>Start Shopping</Button></Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="glass-card p-6 block hover-lift group"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-surface-500">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-surface-400">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariantMap[order.status] || 'default'}>{order.status}</Badge>
                  <ChevronRight className="w-5 h-5 text-surface-400 group-hover:text-primary-500 transition-colors" />
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                {order.items.slice(0, 3).map((item) => (
                  <img
                    key={item.id}
                    src={item.product?.images?.[0]?.url || 'https://placehold.co/60x60/1e293b/94a3b8?text=No+Image'}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg border border-surface-200 dark:border-surface-700"
                  />
                ))}
                {order.items.length > 3 && (
                  <div className="w-14 h-14 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-sm font-medium text-surface-500">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-surface-500">{order.items.length} item(s)</p>
                <p className="text-lg font-bold text-surface-900 dark:text-white">{formatPrice(order.total)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Order Detail (also used for confirmation) ────────────────── */

import { useParams } from 'react-router-dom';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id!),
    enabled: !!id,
  });

  const order = data?.data?.data;

  if (isLoading) return <LoadingSpinner />;

  if (!order) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">Order Not Found</h2>
        <Link to="/orders"><Button>View All Orders</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-surface-500 text-sm">{formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={statusVariantMap[order.status] || 'default'} className="text-sm px-4 py-1.5">
          {order.status}
        </Badge>
      </div>

      <div className="mb-6 flex justify-end">
        <a 
          href={`http://localhost:3001/api/v1/orders/${order.id}/receipt`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={18} /> Download Receipt
          </Button>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <h2 className="font-semibold text-surface-900 dark:text-white mb-4">Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <img
                    src={item.product?.images?.[0]?.url || 'https://placehold.co/60x60/1e293b/94a3b8?text=No+Image'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-surface-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-surface-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h2 className="font-semibold text-surface-900 dark:text-white mb-4">Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-surface-500">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-surface-500">Shipping</span><span>{formatPrice(order.shippingCost)}</span></div>
              <div className="flex justify-between"><span className="text-surface-500">Tax</span><span>{formatPrice(order.tax)}</span></div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between"><span className="text-success-500">Discount</span><span className="text-success-500">-{formatPrice(order.discountAmount)}</span></div>
              )}
              <hr className="border-surface-200 dark:border-surface-700" />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="glass-card p-6">
              <h2 className="font-semibold text-surface-900 dark:text-white mb-4">Shipping To</h2>
              <p className="text-sm text-surface-600 dark:text-surface-400">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/products"><Button variant="outline">Continue Shopping</Button></Link>
      </div>
    </div>
  );
};
