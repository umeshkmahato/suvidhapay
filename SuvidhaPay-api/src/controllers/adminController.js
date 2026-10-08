/* eslint-disable import/prefer-default-export */
import { adminService } from '../services/index.js';

// eslint-disable-next-line import/prefer-default-export
const sendError = (res, error, fallbackStatus = 400) => {
  res.status(error.statusCode || fallbackStatus).json({ error: error.message });
};

export const adminController = {
  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(req, res) {
    try {
      const result = await adminService.getDashboardMetrics(req.validatedData);
      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  },

  /**
   * Get collection report
   */
  async getCollectionReport(req, res) {
    try {
      const result = await adminService.getCollectionReport(req.validatedData);
      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  },

  /**
   * Get vehicle category report
   */
  async getVehicleCategoryReport(req, res) {
    try {
      const result = await adminService.getVehicleCategoryReport(req.validatedData);
      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  },

  /**
   * Get agent collection report
   */
  async getAgentCollectionReport(req, res) {
    try {
      const result = await adminService.getAgentCollectionReport(req.validatedData);
      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  },

  /**
   * Get daily collection chart
   */
  async getDailyCollectionChart(req, res) {
    try {
      const result = await adminService.getDailyCollectionChart(req.validatedData);
      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  },

  /**
   * Get monthly collection chart
   */
  async getMonthlyCollectionChart(req, res) {
    try {
      const result = await adminService.getMonthlyCollectionChart(req.validatedData);
      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  },

  /**
   * Export collection data
   */
  async exportCollectionData(req, res) {
    try {
      const result = await adminService.exportCollectionData(req.validatedData);

      if (result.format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="collection_report.csv"');

        const csv = [
          result.headers.join(','),
          ...result.data.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
        ].join('\n');

        res.send(csv);
      } else if (result.format === 'excel') {
        // Excel will be handled by a separate XLSX library
        res.json({
          message: 'Export prepared',
          ...result,
        });
      }
    } catch (error) {
      sendError(res, error);
    }
  },
};
