import pool from '../config/database.js';

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
      conditions.push(`vehicle_number = $${params.length}`);
    }

    if (mobileNumber) {
      params.push(mobileNumber);
      conditions.push(`mobile_number = $${params.length}`);
    }

    const result = await pool.query(
      `SELECT id, vehicle_number, owner_name, mobile_number, category, address, status, created_at
       FROM vehicles
       WHERE ${conditions.join(' OR ')}
       ORDER BY created_at DESC`,
      params,
    );

    return result.rows;
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
        vehicle_number ILIKE $${params.length}
        OR owner_name ILIKE $${params.length}
        OR mobile_number ILIKE $${params.length}
        OR address ILIKE $${params.length}
      )`);
    }

    if (category) {
      params.push(category);
      filters.push(`category = $${params.length}`);
    }

    if (status) {
      params.push(status);
      filters.push(`status = $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const countParams = [...params];

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        `SELECT id, vehicle_number, owner_name, mobile_number, category, address, status, created_at, updated_at
         FROM vehicles
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      ),
      pool.query(
        `SELECT COUNT(*)::int AS total
         FROM vehicles
         ${whereClause}`,
        countParams,
      ),
    ]);

    const total = countResult.rows[0]?.total || 0;

    return {
      vehicles: dataResult.rows,
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    };
  },
};
