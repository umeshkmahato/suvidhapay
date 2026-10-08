import pool from '../config/database.js';
import { toMoney } from '../utils/dues.js';
import { sql } from '../utils/sql.js';

export { dueModel, rateModel } from './phase2.js';
export { paymentModel, receiptModel, auditLogModel } from './phase3.js';

const mapVehicleBalances = (row) => ({
  ...row,
  total_due: toMoney(row.total_due || 0),
  total_paid: toMoney(row.total_paid || 0),
  outstanding_balance: toMoney(Number(row.total_due || 0) - Number(row.total_paid || 0)),
});

export const userModel = {
  async findByEmail(email) {
    const result = await pool.query(sql.userModel.findByEmail, [email]);
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(sql.userModel.findById, [id]);
    return result.rows[0];
  },

  async updateLastLogin(id) {
    await pool.query(sql.userModel.updateLastLogin, [id]);
  },
};

export const vehicleModel = {
  async findById(id) {
    const result = await pool.query(sql.vehicleModel.findById, [id]);
    return result.rows[0];
  },

  async findByVehicleNumber(vehicleNumber) {
    const result = await pool.query(sql.vehicleModel.findByVehicleNumber, [vehicleNumber]);
    return result.rows[0];
  },

  async create(vehicleData) {
    const result = await pool.query(sql.vehicleModel.create, [
      vehicleData.vehicle_number,
      vehicleData.owner_name,
      vehicleData.mobile_number,
      vehicleData.category,
      vehicleData.address,
      vehicleData.status || 'active',
      vehicleData.created_by,
    ]);
    return result.rows[0];
  },

  async searchByIdentifiers({ vehicleNumber, mobileNumber }) {
    const params = [];
    const conditions = [];

    if (vehicleNumber) {
      params.push(vehicleNumber);
      conditions.push(sql.vehicleModel.filters.identifierVehicleNumber(params.length));
    }

    if (mobileNumber) {
      params.push(mobileNumber);
      conditions.push(sql.vehicleModel.filters.identifierMobileNumber(params.length));
    }

    const result = await pool.query(
      sql.vehicleModel.searchByIdentifiers(sql.common.whereAny(conditions)),
      params,
    );

    return result.rows.map(mapVehicleBalances);
  },

  async list({
    page = 1,
    limit = 10,
    search = '',
    category = null,
    status = null,
  }) {
    const params = [];
    const filters = [];

    if (search) {
      params.push(`%${search}%`);
      filters.push(sql.vehicleModel.filters.listSearch(params.length));
    }

    if (category) {
      params.push(category);
      filters.push(sql.vehicleModel.filters.category(params.length));
    }

    if (status) {
      params.push(status);
      filters.push(sql.vehicleModel.filters.status(params.length));
    }

    const whereClause = sql.common.whereAll(filters);
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const countParams = [...params];

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        sql.vehicleModel.listData(whereClause, dataParams.length - 1, dataParams.length),
        dataParams,
      ),
      pool.query(sql.vehicleModel.listCount(whereClause), countParams),
    ]);

    const total = countResult.rows[0]?.total || 0;

    return {
      vehicles: dataResult.rows.map(mapVehicleBalances),
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    };
  },

  async listOptions() {
    const result = await pool.query(sql.vehicleModel.listOptions);
    return result.rows;
  },
};
