import express from 'express';
import { authController, vehicleController } from '../controllers/index.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import {
  authSchemas,
  vehicleSchemas,
  validateRequest,
} from '../validators/index.js';

const router = express.Router();

router.post('/auth/login', validateRequest(authSchemas.login), authController.login);
router.post(
  '/auth/refresh',
  validateRequest(authSchemas.refreshToken),
  authController.refreshToken,
);
router.get('/auth/me', authenticateToken, authController.me);

router.post(
  '/vehicles',
  authenticateToken,
  authorizeRole('admin', 'agent'),
  validateRequest(vehicleSchemas.create),
  vehicleController.create,
);
router.get(
  '/vehicles/search',
  authenticateToken,
  validateRequest(vehicleSchemas.search, 'query'),
  vehicleController.search,
);
router.get(
  '/vehicles',
  authenticateToken,
  validateRequest(vehicleSchemas.list, 'query'),
  vehicleController.list,
);

export default router;
