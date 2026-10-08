/* eslint-disable import/prefer-default-export */
/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import {
  dueModel, paymentModel, receiptModel, auditLogModel, userModel, vehicleModel,
} from '../models/index.js';

const httpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Generate receipt number in format: RCP-YYYYMMDD-XXXXXX (sequential per day)
const generateReceiptNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  return `RCP-${year}${month}${day}-${random}`;
};

export const collectionService = {
  /**
   * Search for vehicles for collection screen
   */
  async searchVehicles(searchData) {
    const vehicles = await vehicleModel.searchByIdentifiers({
      vehicleNumber: searchData.vehicle_number ? searchData.vehicle_number.trim().toUpperCase().replace(/\s+/g, '') : null,
      mobileNumber: searchData.mobile_number ? searchData.mobile_number.replace(/\s+/g, '') : null,
    });

    if (!vehicles.length) {
      throw httpError('Vehicle not found', 404);
    }

    // Enhance vehicle data with due information
    const vehiclesWithDues = await Promise.all(
      vehicles.map(async (vehicle) => {
        const dueSummary = await dueModel.summarize({ vehicleId: vehicle.id });
        return {
          ...vehicle,
          outstanding_balance: dueSummary.outstanding_balance || 0,
          total_due: dueSummary.total_due || 0,
          total_paid: dueSummary.total_paid || 0,
        };
      }),
    );

    return vehiclesWithDues;
  },

  /**
   * Record a payment for a vehicle
   */
  async recordPayment(paymentData, agentId) {
    const {
      vehicle_id, amount, payment_mode, remarks,
    } = paymentData;

    // Validate vehicle exists and is active
    const vehicle = await vehicleModel.findById(vehicle_id);
    if (!vehicle) {
      throw httpError('Vehicle not found', 404);
    }

    if (vehicle.status !== 'active') {
      throw httpError('Cannot record payment for inactive vehicle', 400);
    }

    // Get outstanding amount
    const dueSummary = await dueModel.summarize({ vehicleId: vehicle_id });
    const outstandingAmount = dueSummary.outstanding_balance || 0;

    // Validate payment amount
    if (amount <= 0) {
      throw httpError('Amount must be greater than 0', 400);
    }

    if (amount > outstandingAmount) {
      throw httpError(`Amount cannot exceed outstanding amount of ₹${outstandingAmount}`, 400);
    }

    // Get agent details
    const agent = await userModel.findById(agentId);
    if (!agent) {
      throw httpError('Agent not found', 404);
    }

    // Create payment record
    const payment = await paymentModel.create({
      vehicle_id,
      agent_id: agentId,
      amount,
      payment_mode,
      remarks: remarks || null,
    });

    // Generate receipt
    const receiptNumber = generateReceiptNumber();
    const today = new Date().toISOString().split('T')[0];

    const receipt = await receiptModel.create({
      receipt_number: receiptNumber,
      payment_id: payment.id,
      vehicle_id: vehicle.id,
      vehicle_number: vehicle.vehicle_number,
      owner_name: vehicle.owner_name,
      agent_id: agentId,
      agent_name: agent.full_name,
      amount,
      collection_date: today,
      payment_mode,
      notes: remarks || null,
    });

    // Update due status - mark paid amount
    // Find the first pending due and update it
    const dues = await dueModel.listByVehicle(vehicle_id, { page: 1, limit: 100 });
    let remainingAmount = amount;

    for (const due of dues.dues) {
      if (due.status === 'paid' || remainingAmount <= 0) {
        continue;
      }

      if (due.status === 'pending') {
        const amountToPay = Math.min(remainingAmount, due.amount);
        const newPaidAmount = (due.paid_amount || 0) + amountToPay;
        const newStatus = newPaidAmount >= due.amount ? 'paid' : 'partial';

        await dueModel.update(due.id, {
          vehicle_id: due.vehicle_id,
          due_date: due.due_date,
          amount: due.amount,
          paid_amount: newPaidAmount,
          status: newStatus,
          notes: due.notes,
          updated_by: agentId,
        });

        remainingAmount -= amountToPay;
      }
    }

    // Log the action
    await auditLogModel.create({
      agent_id: agentId,
      action: 'PAYMENT_RECORDED',
      vehicle_id,
      payment_id: payment.id,
      receipt_id: receipt.id,
      details: {
        amount,
        payment_mode,
        outstanding_before: outstandingAmount,
      },
    });

    return {
      payment,
      receipt,
      outstanding_before: outstandingAmount,
      outstanding_after: outstandingAmount - amount,
    };
  },

  /**
   * Get payment history with filters
   */
  async getPaymentHistory(filters) {
    return paymentModel.list({
      page: filters.page || 1,
      limit: filters.limit || 20,
      vehicleId: filters.vehicle_id || null,
      agentId: filters.agent_id || null,
      fromDate: filters.from_date || null,
      toDate: filters.to_date || null,
    });
  },

  /**
   * Get receipt details
   */
  async getReceipt(receiptId) {
    const receipt = await receiptModel.findById(receiptId);
    if (!receipt) {
      throw httpError('Receipt not found', 404);
    }
    return receipt;
  },

  /**
   * Get receipt by receipt number
   */
  async getReceiptByNumber(receiptNumber) {
    const receipt = await receiptModel.findByReceiptNumber(receiptNumber);
    if (!receipt) {
      throw httpError('Receipt not found', 404);
    }
    return receipt;
  },

  /**
   * Get receipt history with filters
   */
  async getReceiptHistory(filters) {
    return receiptModel.list({
      page: filters.page || 1,
      limit: filters.limit || 20,
      vehicleId: filters.vehicle_id || null,
      agentId: filters.agent_id || null,
      fromDate: filters.from_date || null,
      toDate: filters.to_date || null,
    });
  },
};
