import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { addressApi } from '../../api/orders';
import toast from 'react-hot-toast';
import type { Address } from '../../types';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  address?: Address | null;
}

export const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, address }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    label: 'Home',
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label || 'Home',
        firstName: address.firstName || '',
        lastName: address.lastName || '',
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        phone: address.phone || '',
        isDefault: address.isDefault || false,
      });
    } else {
      setFormData({
        label: 'Home',
        firstName: '',
        lastName: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        isDefault: false,
      });
    }
  }, [address, isOpen]);

  const createMutation = useMutation({
    mutationFn: (data: Omit<Address, 'id'>) => addressApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address saved successfully');
      onClose();
    },
    onError: () => toast.error('Failed to save address'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Address> }) => addressApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address updated successfully');
      onClose();
    },
    onError: () => toast.error('Failed to update address'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address) {
      updateMutation.mutate({ id: address.id, data: formData });
    } else {
      createMutation.mutate(formData as unknown as Omit<Address, 'id'>);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={address ? 'Edit Address' : 'Add New Address'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Label (e.g. Home, Office)"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>
        <Input
          label="Street Address"
          value={formData.street}
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
          <Input
            label="State"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="ZIP Code"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        
        <label className="flex items-center gap-2 cursor-pointer mt-4">
          <input
            type="checkbox"
            className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            checked={formData.isDefault}
            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
          />
          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
            Set as default shipping address
          </span>
        </label>

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
            {address ? 'Update' : 'Save'} Address
          </Button>
        </div>
      </form>
    </Modal>
  );
};
