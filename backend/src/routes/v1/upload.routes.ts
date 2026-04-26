import { Router } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary';
import path from 'path';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { ApiError } from '../../utils/apiError';
import * as uploadController from '../../controllers/upload.controller';

const router = Router();

// Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'thegreat_products',
    // Removed allowed_formats constraint to accept any image type
    // transformation: [{ width: 800, height: 800, crop: 'limit' }], // Optional optimizations
  } as any,
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(ApiError.badRequest('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'));
    }
  },
});

// Routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  upload.array('images', 5),
  uploadController.uploadFiles
);

router.delete(
  '/:publicId',
  authenticate,
  authorize('ADMIN'),
  uploadController.deleteFile
);

export default router;
