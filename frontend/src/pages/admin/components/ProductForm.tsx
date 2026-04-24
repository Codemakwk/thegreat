import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../../../api/products';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { LoadingSpinner } from '../../../components/ui/Shared';
import { ImageUpload } from './ImageUpload';
import toast from 'react-hot-toast';

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    stock: initialData?.stock || '',
    categoryId: initialData?.categoryId || '',
    images: initialData?.images?.map((img: any) => img.url) || [],
    featured: initialData?.featured || false,
    active: initialData?.active ?? true,
  });

  const { data: categoriesData, isLoading: isLoadingCats } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
  });

  const categories = categoriesData?.data?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) return toast.error('Please select a category');
    if (formData.images.length === 0) return toast.error('At least one image is required');

    await onSubmit({
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      images: formData.images.map((url, i) => ({ url, position: i })),
    });
  };

  if (isLoadingCats) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Input
            label="Product Name"
            placeholder="Enter product name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Description
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 focus:ring-2 focus:ring-primary-500/50 outline-none min-h-[120px] text-surface-900 dark:text-white transition-all text-sm"
              placeholder="Detailed product information..."
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            <Input
              label="Stock"
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Category
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 focus:ring-2 focus:ring-primary-500/50 outline-none text-surface-900 dark:text-white transition-all text-sm"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-surface-300 dark:border-surface-700 text-primary-600 focus:ring-primary-500"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              />
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300 group-hover:text-primary-600 transition-colors">
                Featured Product (Shown on Home Page)
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Product Images
          </label>
          <ImageUpload
            images={formData.images}
            onChange={(images) => setFormData({ ...formData, images })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-surface-200 dark:border-surface-700">
        <Button type="submit" isLoading={isSubmitting} className="px-8">
          {initialData ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};
