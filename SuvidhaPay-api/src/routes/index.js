import express from 'express';
import {
  authController,
  dueController,
  rateController,
  vehicleController,
} from '../controllers/index.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import {
  authSchemas,
  dueSchemas,
  rateSchemas,
  vehicleSchemas,
  validateRequest,
  validateUuidParam,
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
  '/vehicles/options',
  authenticateToken,
  vehicleController.options,
);
router.get(
  '/vehicles/:id',
  authenticateToken,
  validateUuidParam('id'),
  validateRequest(vehicleSchemas.detail, 'query'),
  vehicleController.getById,
);
router.get(
  '/vehicles',
  authenticateToken,
  validateRequest(vehicleSchemas.list, 'query'),
  vehicleController.list,
);

router.get('/rate-master', authenticateToken, rateController.list);
router.put(
  '/rate-master',
  authenticateToken,
  authorizeRole('admin'),
  validateRequest(rateSchemas.save),
  rateController.save,
);

router.get(
  '/dues/outstanding',
  authenticateToken,
  validateRequest(dueSchemas.outstanding, 'query'),
  dueController.outstanding,
);
router.post(
  '/dues',
  authenticateToken,
  authorizeRole('admin'),
  validateRequest(dueSchemas.create),
  dueController.create,
);
router.get(
  '/dues',
  authenticateToken,
  validateRequest(dueSchemas.list, 'query'),
  dueController.list,
);
router.get(
  '/dues/:id',
  authenticateToken,
  validateUuidParam('id'),
  dueController.getById,
);
router.put(
  '/dues/:id',
  authenticateToken,
  authorizeRole('admin'),
  validateUuidParam('id'),
  validateRequest(dueSchemas.update),
  dueController.update,
);
router.post(
  '/dues/:id/cancel',
  authenticateToken,
  authorizeRole('admin'),
  validateUuidParam('id'),
  validateRequest(dueSchemas.cancel),
  dueController.cancel,
);

export default router;
