import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { productsApi } from '../../api/products';
import { Badge, LoadingSpinner } from '../../components/ui/Shared';
import { Button } from '../../components/ui/Button';
import { formatPrice, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import type { Order } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { ProductForm } from './components/ProductForm';
import { Trash2, Edit } from 'lucide-react';

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning', PROCESSING: 'info', SHIPPED: 'info', DELIVERED: 'success', CANCELLED: 'danger', REFUNDED: 'default',
};

export const AdminOrders: React.FC = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => adminApi.getOrders({ limit: 50 }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Order status updated');
    },
  });

  const orders: Order[] = data?.data?.data?.orders || [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="page-enter">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Order Management</h1>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Order</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Customer</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Date</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Total</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="px-6 py-4 text-sm font-mono text-surface-900 dark:text-white">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                    {order.user?.firstName} {order.user?.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-surface-900 dark:text-white">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={statusColors[order.status]}>{order.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateMutation.mutate({ id: order.id, status: e.target.value })}
                      className="text-xs px-2 py-1.5 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 focus:ring-2 focus:ring-primary-500/50 outline-none"
                    >
                      {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── Admin Users ───────────────────────────────────────────────── */

export const AdminUsers: React.FC = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.getUsers({ limit: 50 }),
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleBanUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User status updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User deleted');
    },
  });

  const users = data?.data?.data?.users || [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="page-enter">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">User Management</h1>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">User</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Role</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Orders</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Joined</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id} className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-surface-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.role === 'ADMIN' ? 'info' : 'default'}>{user.role}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{user._count?.orders || 0}</td>
                  <td className="px-6 py-4">
                    <Badge variant={user.banned ? 'danger' : 'success'}>{user.banned ? 'Banned' : 'Active'}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {user.role !== 'ADMIN' && (
                        <>
                          <Button
                            variant={user.banned ? 'outline' : 'danger'}
                            size="sm"
                            onClick={() => banMutation.mutate(user.id)}
                          >
                            {user.banned ? 'Unban' : 'Ban'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            if (confirm('Delete this user?')) deleteMutation.mutate(user.id);
                          }}>
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── Admin Products ────────────────────────────────────────────── */

export const AdminProducts: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', { limit: 50 }],
    queryFn: () => productsApi.getAll({ limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated');
      setIsModalOpen(false);
      setEditingProduct(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    },
  });

  const products = data?.data?.data?.products || [];

  if (isLoading) return <LoadingSpinner />;

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (data: any) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Product Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>Add Product</Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="xl"
      >
        <ProductForm
          initialData={editingProduct}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Product</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Category</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Price</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Stock</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any) => (
                <tr key={product.id} className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.images?.[0]?.url || 'https://placehold.co/40x40/1e293b/94a3b8?text=No+Image'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <span className="text-sm font-medium text-surface-900 dark:text-white">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500">{product.category?.name}</td>
                  <td className="px-6 py-4 text-sm font-semibold">{formatPrice(product.price)}</td>
                  <td className="px-6 py-4 text-sm">{product.stock}</td>
                  <td className="px-6 py-4">
                    <Badge variant={product.active ? 'success' : 'default'}>{product.active ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1.5 text-surface-400 hover:text-primary-500 transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete product?')) deleteMutation.mutate(product.id); }}
                        className="p-1.5 text-surface-400 hover:text-danger-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── Admin Coupons ─────────────────────────────────────────────── */

export const AdminCoupons: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => adminApi.getCoupons(),
  });

  const coupons = data?.data?.data || [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Coupon Management</h1>
        <Button>Create Coupon</Button>
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Code</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Discount</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Uses</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Min Order</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Expires</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon: any) => (
                <tr key={coupon.id} className="border-b border-surface-100 dark:border-surface-800">
                  <td className="px-6 py-4 font-mono text-sm font-bold text-primary-600 dark:text-primary-400">{coupon.code}</td>
                  <td className="px-6 py-4 text-sm">{coupon.discountPercent}%</td>
                  <td className="px-6 py-4 text-sm">{coupon.usedCount} / {coupon.maxUses || '∞'}</td>
                  <td className="px-6 py-4 text-sm">{coupon.minOrderAmount ? formatPrice(coupon.minOrderAmount) : '–'}</td>
                  <td className="px-6 py-4 text-sm text-surface-500">{coupon.expiresAt ? formatDate(coupon.expiresAt) : 'Never'}</td>
                  <td className="px-6 py-4"><Badge variant={coupon.active ? 'success' : 'default'}>{coupon.active ? 'Active' : 'Inactive'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
