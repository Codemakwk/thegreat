import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ images, onChange, maxImages = 5 }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    setIsUploading(true);
    try {
      // Direct call to the new upload API
      const response = await axios.post('/api/v1/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      if (response.data.success) {
        onChange([...images, ...response.data.data]);
        toast.success('Images uploaded successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div key={url} className="relative aspect-square group">
            <img
              src={url.startsWith('/') ? url : url}
              alt="Product"
              className="w-full h-full object-cover rounded-xl border border-surface-200 dark:border-surface-700"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 p-1.5 bg-danger-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <label className={`
            aspect-square flex flex-col items-center justify-center gap-2 
            border-2 border-dashed border-surface-300 dark:border-surface-700 
            rounded-xl cursor-pointer hover:border-primary-500 transition-colors
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          `}>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {isUploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            ) : (
              <>
                <Upload className="text-surface-400" size={24} />
                <span className="text-xs text-surface-500 font-medium">Upload Image</span>
              </>
            )}
          </label>
        )}
      </div>
      <p className="text-xs text-surface-500 italic">
        Max 5 images. PNG, JPG or WebP. 5MB max each.
      </p>
    </div>
  );
};
