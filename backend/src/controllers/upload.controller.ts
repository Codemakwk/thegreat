import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import cloudinary from '../config/cloudinary';

/**
 * POST /api/v1/upload
 * Handle single or multiple file uploads to Cloudinary
 */
export const uploadFiles = asyncHandler(async (req: Request, res: Response) => {
  if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
    throw ApiError.badRequest('No files uploaded');
  }

  const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
  
  const fileUrls = files.map((file: any) => {
    // multer-storage-cloudinary adds the secure URL to `path`
    return file.path;
  });

  res.json({
    success: true,
    data: fileUrls,
  });
});

/**
 * DELETE /api/v1/upload/:publicId
 * Delete a file from Cloudinary storage
 */
export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const { publicId } = req.params;
  
  if (!publicId) {
    throw ApiError.badRequest('Public ID is required');
  }

  // Cloudinary uses the public_id to destroy files
  // Because our folder is 'thegreat_products', the full public_id should include it.
  // Wait, frontend might just pass the URL, but let's assume they pass the public_id or we extract it.
  
  await cloudinary.uploader.destroy(`thegreat_products/${publicId}`);
  
  res.json({ success: true, message: 'File deleted' });
});
