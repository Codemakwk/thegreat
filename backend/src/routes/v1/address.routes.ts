import { Router } from 'express';
import * as addressController from '../../controllers/address.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All address routes require authentication
router.use(authenticate);

router.get('/', addressController.getAddresses);
router.post('/', addressController.createAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);

export default router;
