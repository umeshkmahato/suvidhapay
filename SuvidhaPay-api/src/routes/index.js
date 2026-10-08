import express from 'express';
import {
  authController,
  collectionController,
  dueController,
  rateController,
  vehicleController,
  adminController,
} from '../controllers/index.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import {
  authSchemas,
  collectionSchemas,
  dueSchemas,
  rateSchemas,
  vehicleSchemas,
  adminSchemas,
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
  authorizeRole('admin', 'collector', 'officer'),
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

// Collection API (Phase 3) - Digitized Collection Process
router.get(
  '/collection/search',
  authenticateToken,
  authorizeRole('collector'),
  validateRequest(collectionSchemas.searchVehicles, 'query'),
  collectionController.searchVehicles,
);

router.post(
  '/collection/payment',
  authenticateToken,
  authorizeRole('collector'),
  validateRequest(collectionSchemas.recordPayment),
  collectionController.recordPayment,
);

router.get(
  '/collection/payments',
  authenticateToken,
  validateRequest(collectionSchemas.paymentHistory, 'query'),
  collectionController.getPaymentHistory,
);

router.get(
  '/collection/receipts/:id',
  authenticateToken,
  validateUuidParam('id'),
  collectionController.getReceipt,
);

router.get(
  '/collection/receipts/number/:receiptNumber',
  authenticateToken,
  collectionController.getReceiptByNumber,
);

router.get(
  '/collection/receipts',
  authenticateToken,
  validateRequest(collectionSchemas.receiptHistory, 'query'),
  collectionController.getReceiptHistory,
);

// Admin Dashboard Routes (Phase 4)
router.get(
  '/admin/dashboard/metrics',
  authenticateToken,
  authorizeRole('admin'),
  validateRequest(adminSchemas.dashboardMetrics, 'query'),
  adminController.getDashboardMetrics,
);

router.get(
  '/admin/reports/collection',
  authenticateToken,
  authorizeRole('admin'),
  validateRequest(adminSchemas.collectionReport, 'query'),
  adminController.getCollectionReport,
);

router.get(
  '/admin/reports/vehicle-category',
  authenticateToken,
  authorizeRole('admin'),
  validateRequest(adminSchemas.vehicleCategoryReport, 'query'),
  adminController.getVehicleCategoryReport,
);

router.get(
  '/admin/reports/agent-collection',
  authenticateToken,
  authorizeRole('admin'),
  validateRequest(adminSchemas.agentCollectionReport, 'query'),
  adminController.getAgentCollectionReport,
);

router.get(
  '/admin/charts/daily-collection',
  authenticateToken,
  authorizeRole('admin'),
  validateRequest(adminSchemas.chartData, 'query'),
  adminController.getDailyCollectionChart,
);

router.get(
  '/admin/charts/monthly-collection',
  authenticateToken,
  authorizeRole('admin'),
  validateRequest(adminSchemas.chartData, 'query'),
  adminController.getMonthlyCollectionChart,
);

router.get(
  '/admin/export/collection',
  authenticateToken,
  authorizeRole('admin'),
  validateRequest(adminSchemas.exportData, 'query'),
  adminController.exportCollectionData,
);

export default router;
