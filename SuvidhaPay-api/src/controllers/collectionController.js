/* eslint-disable import/prefer-default-export */
import { collectionService } from '../services/index.js';

// eslint-disable-next-line import/prefer-default-export
const sendError = (res, error, fallbackStatus = 400) => {
  res.status(error.statusCode || fallbackStatus).json({ error: error.message });
};

export const collectionController = {
  /**
   * Search vehicles for collection
   */
  async searchVehicles(req, res) {
    try {
      const vehicles = await collectionService.searchVehicles(req.validatedData);
      res.json({ vehicles });
    } catch (error) {
      sendError(res, error);
    }
  },

  /**
   * Record payment
   */
  async recordPayment(req, res) {
    try {
      const result = await collectionService.recordPayment(req.validatedData, req.user.userId);
      res.status(201).json({
        message: 'Payment recorded successfully',
        payment: result.payment,
        receipt: result.receipt,
        outstanding_before: result.outstanding_before,
        outstanding_after: result.outstanding_after,
      });
    } catch (error) {
      sendError(res, error);
    }
  },

  /**
   * Get payment history
   */
  async getPaymentHistory(req, res) {
    try {
      const result = await collectionService.getPaymentHistory(req.validatedData);
      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  },

  /**
   * Get receipt by ID
   */
  async getReceipt(req, res) {
    try {
      const receipt = await collectionService.getReceipt(req.params.id);
      res.json({ receipt });
    } catch (error) {
      sendError(res, error);
    }
  },

  /**
   * Get receipt by receipt number
   */
  async getReceiptByNumber(req, res) {
    try {
      const receipt = await collectionService.getReceiptByNumber(req.params.receiptNumber);
      res.json({ receipt });
    } catch (error) {
      sendError(res, error);
    }
  },

  /**
   * Get receipt history
   */
  async getReceiptHistory(req, res) {
    try {
      const result = await collectionService.getReceiptHistory(req.validatedData);
      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  },
};
