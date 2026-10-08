import pool from '../config/database.js';
import { toMoney } from '../utils/dues.js';

export { dueModel, rateModel } from './phase2.js';

const vehicleBalanceJoin = `
  LEFT JOIN (
    SELECT
      vehicle_id,
      COALESCE(SUM(amount) FILTER (WHERE status <> 'cancelled'), 0) AS total_due,
      COALESCE(SUM(paid_amount) FILTER (WHERE status <> 'cancelled'), 0) AS total_paid
    FROM dues
    GROUP BY vehicle_id
  ) balances ON balances.vehicle_id = v.id
`;

const mapVehicleBalances = (row) => ({
  ...row,
  total_due: toMoney(row.total_due || 0),
  total_paid: toMoney(row.total_paid || 0),
  outstanding_balance: toMoney(Number(row.total_due || 0) - Number(row.total_paid || 0)),
});

export const userModel = {
  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT id, email, full_name, mobile_number, role, is_active, created_at, updated_at FROM users WHERE id = $1',
      [id],
    );
    return result.rows[0];
  },

  async updateLastLogin(id) {
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [id]);
  },
};

export const vehicleModel = {
  async findById(id) {
    const result = await pool.query(
      `SELECT id, vehicle_number, owner_name, mobile_number, category, address, status, created_at, updated_at
       FROM vehicles
       WHERE id = $1`,
      [id],
    );
    return result.rows[0];
  },

  async findByVehicleNumber(vehicleNumber) {
    const result = await pool.query(
      'SELECT * FROM vehicles WHERE vehicle_number = $1',
      [vehicleNumber],
    );
    return result.rows[0];
  },

  async create(vehicleData) {
    const result = await pool.query(
      `INSERT INTO vehicles (
         vehicle_number,
         owner_name,
         mobile_number,
         category,
         address,
         status,
         created_by,
         updated_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
       RETURNING *`,
      [
        vehicleData.vehicle_number,
        vehicleData.owner_name,
        vehicleData.mobile_number,
        vehicleData.category,
        vehicleData.address,
        vehicleData.status || 'active',
        vehicleData.created_by,
      ],
    );
    return result.rows[0];
  },

  async searchByIdentifiers({ vehicleNumber, mobileNumber }) {
    const params = [];
    const conditions = [];

    if (vehicleNumber) {
      params.push(vehicleNumber);
      conditions.push(`v.vehicle_number = $${params.length}`);
    }

    if (mobileNumber) {
      params.push(mobileNumber);
      conditions.push(`v.mobile_number = $${params.length}`);
    }

    const result = await pool.query(
      `SELECT
         v.id,
         v.vehicle_number,
         v.owner_name,
         v.mobile_number,
         v.category,
         v.address,
         v.status,
         v.created_at,
         COALESCE(balances.total_due, 0) AS total_due,
         COALESCE(balances.total_paid, 0) AS total_paid
       FROM vehicles v
       ${vehicleBalanceJoin}
       WHERE ${conditions.join(' OR ')}
       ORDER BY v.created_at DESC`,
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
      filters.push(`(
        v.vehicle_number ILIKE $${params.length}
        OR v.owner_name ILIKE $${params.length}
        OR v.mobile_number ILIKE $${params.length}
        OR v.address ILIKE $${params.length}
      )`);
    }

    if (category) {
      params.push(category);
      filters.push(`v.category = $${params.length}`);
    }

    if (status) {
      params.push(status);
      filters.push(`v.status = $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const countParams = [...params];

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        `SELECT
           v.id,
           v.vehicle_number,
           v.owner_name,
           v.mobile_number,
           v.category,
           v.address,
           v.status,
           v.created_at,
           v.updated_at,
           COALESCE(balances.total_due, 0) AS total_due,
           COALESCE(balances.total_paid, 0) AS total_paid
         FROM vehicles v
         ${vehicleBalanceJoin}
         ${whereClause}
         ORDER BY v.created_at DESC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      ),
      pool.query(
        `SELECT COUNT(*)::int AS total
         FROM vehicles v
         ${whereClause}`,
        countParams,
      ),
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
    const result = await pool.query(
      `SELECT id, vehicle_number, owner_name, mobile_number, category, status
       FROM vehicles
       ORDER BY vehicle_number ASC
       LIMIT 1000`,
    );
    return result.rows;
  },
};
