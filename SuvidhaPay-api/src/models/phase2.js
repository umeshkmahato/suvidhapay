import pool from '../config/database.js';
import { toMoney } from '../utils/dues.js';
import { sql } from '../utils/sql.js';

const mapRate = (row) => {
  if (!row) {
    return null;
  }

  return {
    ...row,
    amount: toMoney(row.amount),
  };
};

const mapDue = (row) => {
  if (!row) {
    return null;
  }

  const amount = toMoney(row.amount);
  const paidAmount = toMoney(row.paid_amount);

  return {
    ...row,
    amount,
    paid_amount: paidAmount,
    applied_rate: row.applied_rate === null || row.applied_rate === undefined
      ? null
      : toMoney(row.applied_rate),
    outstanding_amount: row.status === 'cancelled' ? 0 : toMoney(amount - paidAmount),
  };
};

const mapOutstanding = (totalDue, totalPaid) => {
  const due = toMoney(totalDue);
  const paid = toMoney(totalPaid);

  return {
    total_due: due,
    total_paid: paid,
    outstanding_balance: toMoney(due - paid),
  };
};

export const rateModel = {
  async list() {
    const [currentResult, historyResult] = await Promise.all([
      pool.query(sql.rateModel.listActive),
      pool.query(sql.rateModel.listHistory),
    ]);

    return {
      rates: currentResult.rows.map(mapRate),
      history: historyResult.rows.map(mapRate),
    };
  },

  async findActiveByCategory(category) {
    const result = await pool.query(sql.rateModel.findActiveByCategory, [category]);

    return mapRate(result.rows[0]);
  },

  async saveActiveRates(items, userId) {
    const client = await pool.connect();

    try {
      await client.query(sql.common.beginTransaction);
      const saved = [];

      /* eslint-disable no-await-in-loop */
      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        const current = await client.query(sql.rateModel.lockActiveByCategory, [item.category]);
        const existing = current.rows[0];
        const sameAmount = existing && toMoney(existing.amount) === toMoney(item.amount);

        if (sameAmount) {
          const updated = await client.query(sql.rateModel.updateActiveNotes, [
            existing.id,
            item.notes || null,
            userId,
          ]);
          saved.push(mapRate(updated.rows[0]));
        } else if (existing) {
          await client.query(sql.rateModel.deactivateActiveRate, [existing.id, userId]);
        }

        if (!sameAmount) {
          const inserted = await client.query(sql.rateModel.insertActiveRate, [
            item.category,
            item.amount,
            item.notes || null,
            userId,
          ]);
          saved.push(mapRate(inserted.rows[0]));
        }
      }
      /* eslint-enable no-await-in-loop */

      await client.query(sql.common.commitTransaction);
      return saved;
    } catch (error) {
      await client.query(sql.common.rollbackTransaction);
      throw error;
    } finally {
      client.release();
    }
  },
};

export const dueModel = {
  async create(dueData) {
    const result = await pool.query(sql.dueModel.create, [
      dueData.vehicle_id,
      dueData.rate_master_id,
      dueData.due_date,
      dueData.amount,
      dueData.paid_amount,
      dueData.status,
      dueData.notes,
      dueData.created_by,
    ]);

    return this.findById(result.rows[0].id);
  },

  async findById(id) {
    const result = await pool.query(sql.dueModel.findById, [id]);
    return mapDue(result.rows[0]);
  },

  async list({
    page = 1,
    limit = 10,
    vehicleId = null,
    status = null,
    fromDate = null,
    toDate = null,
  }) {
    const params = [];
    const filters = [];

    if (vehicleId) {
      params.push(vehicleId);
      filters.push(sql.dueModel.filters.vehicleId(params.length));
    }

    if (status) {
      params.push(status);
      filters.push(sql.dueModel.filters.status(params.length));
    }

    if (fromDate) {
      params.push(fromDate);
      filters.push(sql.dueModel.filters.fromDate(params.length));
    }

    if (toDate) {
      params.push(toDate);
      filters.push(sql.dueModel.filters.toDate(params.length));
    }

    const whereClause = sql.common.whereAll(filters);
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        sql.dueModel.listData(whereClause, dataParams.length - 1, dataParams.length),
        dataParams,
      ),
      pool.query(sql.dueModel.listCount(whereClause), params),
    ]);

    const total = countResult.rows[0]?.total || 0;

    return {
      dues: dataResult.rows.map(mapDue),
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    };
  },

  async summarize({ vehicleId = null, fromDate = null, toDate = null } = {}) {
    const params = [];
    const filters = [sql.dueModel.fragments.openDueFilter];

    if (vehicleId) {
      params.push(vehicleId);
      filters.push(sql.dueModel.filters.vehicleId(params.length));
    }

    if (fromDate) {
      params.push(fromDate);
      filters.push(sql.dueModel.filters.fromDate(params.length));
    }

    if (toDate) {
      params.push(toDate);
      filters.push(sql.dueModel.filters.toDate(params.length));
    }

    const result = await pool.query(sql.dueModel.summarize(sql.common.and(filters)), params);

    return mapOutstanding(result.rows[0].total_due, result.rows[0].total_paid);
  },

  async summarizeByVehicle(vehicleId = null) {
    const params = [];
    let vehicleFilter = '';

    if (vehicleId) {
      params.push(vehicleId);
      vehicleFilter = sql.common.whereAll([sql.dueModel.filters.summaryVehicleId(params.length)]);
    }

    const result = await pool.query(sql.dueModel.summarizeByVehicle(vehicleFilter), params);

    return result.rows.map((row) => ({
      vehicle_id: row.vehicle_id,
      vehicle_number: row.vehicle_number,
      owner_name: row.owner_name,
      category: row.category,
      vehicle_status: row.vehicle_status,
      ...mapOutstanding(row.total_due, row.total_paid),
    }));
  },

  async update(id, dueData) {
    const result = await pool.query(sql.dueModel.update, [
      id,
      dueData.vehicle_id,
      dueData.due_date,
      dueData.amount,
      dueData.paid_amount,
      dueData.status,
      dueData.notes,
      dueData.updated_by,
    ]);

    if (!result.rows[0]) {
      return null;
    }

    return this.findById(id);
  },

  async cancel(id, { userId, reason }) {
    const result = await pool.query(sql.dueModel.cancel, [id, reason || null, userId]);

    if (!result.rows[0]) {
      return null;
    }

    return this.findById(id);
  },

  async listByVehicle(vehicleId, { page = 1, limit = 20 }) {
    return this.list({
      page,
      limit,
      vehicleId,
    });
  },
};
