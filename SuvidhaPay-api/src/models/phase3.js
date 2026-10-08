/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import pool from '../config/database.js';
import { toMoney } from '../utils/dues.js';
import { sql } from '../utils/sql.js';

const httpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const paymentModel = {
  async create(paymentData) {
    const {
      vehicle_id, agent_id, amount, payment_mode, remarks,
    } = paymentData;

    const result = await pool.query(sql.paymentModel.create, [
      vehicle_id,
      agent_id,
      amount,
      payment_mode,
      'completed',
      remarks || null,
    ]);
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(sql.paymentModel.findById, [id]);
    return result.rows[0];
  },

  async list({
    page = 1,
    limit = 20,
    vehicleId = null,
    agentId = null,
    fromDate = null,
    toDate = null,
  }) {
    const params = [];
    const filters = [];

    if (vehicleId) {
      params.push(vehicleId);
      filters.push(sql.paymentModel.filters.vehicleId(params.length));
    }

    if (agentId) {
      params.push(agentId);
      filters.push(sql.paymentModel.filters.agentId(params.length));
    }

    if (fromDate) {
      params.push(fromDate);
      filters.push(sql.paymentModel.filters.fromDate(params.length));
    }

    if (toDate) {
      params.push(toDate);
      filters.push(sql.paymentModel.filters.toDate(params.length));
    }

    const whereClause = sql.common.whereAll(filters);
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const countParams = [...params];

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        sql.paymentModel.listData(whereClause, dataParams.length - 1, dataParams.length),
        dataParams,
      ),
      pool.query(sql.paymentModel.listCount(whereClause), countParams),
    ]);

    const total = countResult.rows[0]?.total || 0;

    return {
      payments: dataResult.rows.map((row) => ({
        ...row,
        amount: toMoney(row.amount),
      })),
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    };
  },
};

export const receiptModel = {
  async create(receiptData) {
    const {
      receipt_number, payment_id, vehicle_id, vehicle_number, owner_name,
      agent_id, agent_name, amount, collection_date, payment_mode, notes,
    } = receiptData;

    const result = await pool.query(sql.receiptModel.create, [
      receipt_number,
      payment_id,
      vehicle_id,
      vehicle_number,
      owner_name,
      agent_id,
      agent_name,
      amount,
      collection_date,
      payment_mode,
      notes || null,
    ]);
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(sql.receiptModel.findById, [id]);
    return result.rows[0];
  },

  async findByReceiptNumber(receiptNumber) {
    const result = await pool.query(sql.receiptModel.findByReceiptNumber, [receiptNumber]);
    return result.rows[0];
  },

  async list({
    page = 1,
    limit = 20,
    vehicleId = null,
    agentId = null,
    fromDate = null,
    toDate = null,
  }) {
    const params = [];
    const filters = [];

    if (vehicleId) {
      params.push(vehicleId);
      filters.push(sql.receiptModel.filters.vehicleId(params.length));
    }

    if (agentId) {
      params.push(agentId);
      filters.push(sql.receiptModel.filters.agentId(params.length));
    }

    if (fromDate) {
      params.push(fromDate);
      filters.push(sql.receiptModel.filters.fromDate(params.length));
    }

    if (toDate) {
      params.push(toDate);
      filters.push(sql.receiptModel.filters.toDate(params.length));
    }

    const whereClause = sql.common.whereAll(filters);
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const countParams = [...params];

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        sql.receiptModel.listData(whereClause, dataParams.length - 1, dataParams.length),
        dataParams,
      ),
      pool.query(sql.receiptModel.listCount(whereClause), countParams),
    ]);

    const total = countResult.rows[0]?.total || 0;

    return {
      receipts: dataResult.rows.map((row) => ({
        ...row,
        amount: toMoney(row.amount),
      })),
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    };
  },
};

export const auditLogModel = {
  async create(logData) {
    const {
      agent_id, action, vehicle_id, payment_id, receipt_id, details, ip_address,
    } = logData;

    await pool.query(sql.auditLogModel.create, [
      agent_id,
      action,
      vehicle_id || null,
      payment_id || null,
      receipt_id || null,
      details || null,
      ip_address || null,
    ]);
  },
};
