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

  const { data: addressData, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.getAll(),
  });

  const addresses: Address[] = addressData?.data?.data || [];

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

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        address={editingAddress}
      />

      <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {user?.firstName?.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-surface-500 mb-4">{user?.email}</p>
            <div className="flex items-center justify-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                user?.role === 'ADMIN' ? 'bg-primary-500/15 text-primary-500' : 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400'
              }`}>
                {user?.role}
              </span>
              {user?.emailVerified && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-success-500/15 text-success-500 font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            {user?.createdAt && (
              <p className="text-xs text-surface-400 mt-4">Member since {formatDate(user.createdAt)}</p>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
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
