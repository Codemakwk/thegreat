import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { addressApi } from '../api/orders';
import { LoadingSpinner } from '../components/ui/Shared';
import { Button } from '../components/ui/Button';
import { User, Mail, MapPin, Shield } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import type { Address } from '../types';
import { AddressModal } from './components/AddressModal';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<Address | null>(null);

  const { data: addressData, isLoading: loadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.getAll(),
  });

  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['profile-stats'],
    queryFn: () => authApi.getProfileStats(),
  });

  const addresses: Address[] = addressData?.data?.data || [];
  const stats = statsData?.data?.data;

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => addressApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address deleted');
    },
    onError: () => toast.error('Failed to delete address'),
  });

  const handleEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setIsAddressModalOpen(true);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  if (loadingAddresses || loadingStats) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        address={editingAddress}
      />

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">Account Center</h1>
        <p className="text-surface-500">Manage your profile, orders, and addresses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg shadow-primary-500/20">
              {user?.firstName?.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-surface-500 mb-4 truncate">{user?.email}</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant={user?.role === 'ADMIN' ? 'info' : 'default'}>{user?.role}</Badge>
              {user?.emailVerified && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-success-500/10 text-success-500 font-medium border border-success-500/20 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <hr className="border-surface-200 dark:border-surface-700 my-4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs text-surface-500 uppercase tracking-wider font-semibold">Orders</p>
                <p className="text-lg font-bold text-surface-900 dark:text-white">{stats?.orderCount || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-surface-500 uppercase tracking-wider font-semibold">Spent</p>
                <p className="text-lg font-bold text-surface-900 dark:text-white">{formatPrice(stats?.totalSpent || 0)}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <nav className="space-y-1">
              <button className="w-full text-left px-4 py-2.5 rounded-xl bg-primary-500/10 text-primary-600 font-medium">Dashboard</button>
              <Link to="/orders" className="block px-4 py-2.5 rounded-xl text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">Order History</Link>
              <button className="w-full text-left px-4 py-2.5 rounded-xl text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">Settings</button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Recent Orders Section */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-500" /> Recent Orders
              </h3>
              <Link to="/orders" className="text-sm text-primary-600 hover:underline">View all</Link>
            </div>

            {stats?.recentOrders?.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order: any) => (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-700 hover:border-primary-500/50 transition-all group"
                  >
                    <div className="flex -space-x-4">
                      {order.items.slice(0, 3).map((item: any, i: number) => (
                        <img
                          key={item.id}
                          src={item.product?.images?.[0]?.url || 'https://placehold.co/48x48'}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover ring-2 ring-white dark:ring-surface-900 shadow-sm"
                          style={{ zIndex: 3 - i }}
                        />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-900 dark:text-white text-sm truncate">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-surface-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-surface-900 dark:text-white">{formatPrice(order.total)}</p>
                      <Badge variant={order.status === 'DELIVERED' ? 'success' : 'warning'} className="text-[10px]">
                        {order.status}
                      </Badge>
                    </div>
                    <ChevronRight className="w-4 h-4 text-surface-300 group-hover:text-primary-500 transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-surface-50 dark:bg-surface-800/50 rounded-2xl border border-dashed border-surface-200 dark:border-surface-700">
                <p className="text-sm text-surface-500">You haven't placed any orders yet.</p>
                <Link to="/products" className="text-primary-600 text-sm mt-2 inline-block hover:underline">Start shopping</Link>
              </div>
            )}
          </div>

          {/* Personal Info */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" /> Personal Info
              </h3>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-surface-500 mb-1">First Name</p>
                <p className="font-medium text-surface-900 dark:text-white">{user?.firstName}</p>
              </div>
              <div>
                <p className="text-xs text-surface-500 mb-1">Last Name</p>
                <p className="font-medium text-surface-900 dark:text-white">{user?.lastName}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-surface-500 mb-1">Email</p>
                <p className="font-medium text-surface-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-surface-400" />
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-500" /> Saved Addresses
              </h3>
              <Button variant="outline" size="sm" onClick={handleAddNewAddress}>Add New</Button>
            </div>
            {addresses.length === 0 ? (
              <p className="text-surface-500 text-sm">No addresses saved yet.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">
                          {addr.label}
                          {addr.isDefault && (
                            <span className="ml-2 text-xs text-primary-500">(Default)</span>
                          )}
                        </p>
                        <p className="text-sm text-surface-500 mt-1">
                          {addr.firstName} {addr.lastName}<br />
                          {addr.street}<br />
                          {addr.city}, {addr.state} {addr.zipCode}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditAddress(addr)}>Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete address?')) deleteAddressMutation.mutate(addr.id); }} className="text-danger-500 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10">Delete</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
