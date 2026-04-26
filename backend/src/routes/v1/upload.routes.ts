import { Router } from 'express';
import multer from 'multer';
const { CloudinaryStorage } = require('multer-storage-cloudinary');
import cloudinary from '../../config/cloudinary';
import path from 'path';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import * as uploadController from '../../controllers/upload.controller';

const router = Router();

// Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'thegreat_products',
    allowed_formats: ['jpeg', 'jpg', 'png', 'webp', 'gif'],
    // transformation: [{ width: 800, height: 800, crop: 'limit' }], // Optional optimizations
  } as any,
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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
