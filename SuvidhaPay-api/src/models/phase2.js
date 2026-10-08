import pool from '../config/database.js';
import { toMoney } from '../utils/dues.js';

const dueSelect = `
  SELECT
    d.id,
    d.vehicle_id,
    d.rate_master_id,
    d.due_date::text AS due_date,
    d.amount,
    d.paid_amount,
    d.status,
    d.notes,
    d.cancellation_reason,
    d.cancelled_at,
    d.cancelled_by,
    d.created_by,
    d.updated_by,
    d.created_at,
    d.updated_at,
    v.vehicle_number,
    v.owner_name,
    v.category,
    v.mobile_number,
    r.amount AS applied_rate
  FROM dues d
  JOIN vehicles v ON v.id = d.vehicle_id
  LEFT JOIN rate_master r ON r.id = d.rate_master_id
`;

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

const openDueFilter = 'd.status <> \'cancelled\'';

export const rateModel = {
  async list() {
    const [currentResult, historyResult] = await Promise.all([
      pool.query(
        `SELECT
           id,
           category,
           amount,
           effective_from::text AS effective_from,
           effective_to::text AS effective_to,
           is_active,
           notes,
           created_by,
           updated_by,
           created_at,
           updated_at
         FROM rate_master
         WHERE is_active = TRUE
         ORDER BY category ASC`,
      ),
      pool.query(
        `SELECT
           id,
           category,
           amount,
           effective_from::text AS effective_from,
           effective_to::text AS effective_to,
           is_active,
           notes,
           created_by,
           updated_by,
           created_at,
           updated_at
         FROM rate_master
         ORDER BY created_at DESC, category ASC`,
      ),
    ]);

    return {
      rates: currentResult.rows.map(mapRate),
      history: historyResult.rows.map(mapRate),
    };
  },

  async findActiveByCategory(category) {
    const result = await pool.query(
      `SELECT
         id,
         category,
         amount,
         effective_from::text AS effective_from,
         effective_to::text AS effective_to,
         is_active,
         notes,
         created_at,
         updated_at
       FROM rate_master
       WHERE category = $1 AND is_active = TRUE`,
      [category],
    );

    return mapRate(result.rows[0]);
  },

  async saveActiveRates(items, userId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const saved = [];

      /* eslint-disable no-await-in-loop */
      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        const current = await client.query(
          `SELECT id, amount
           FROM rate_master
           WHERE category = $1 AND is_active = TRUE
           FOR UPDATE`,
          [item.category],
        );
        const existing = current.rows[0];
        const sameAmount = existing && toMoney(existing.amount) === toMoney(item.amount);

        if (sameAmount) {
          const updated = await client.query(
            `UPDATE rate_master
             SET notes = $2,
                 updated_by = $3,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING
               id,
               category,
               amount,
               effective_from::text AS effective_from,
               effective_to::text AS effective_to,
               is_active,
               notes,
               created_at,
               updated_at`,
            [existing.id, item.notes || null, userId],
          );
          saved.push(mapRate(updated.rows[0]));
        } else if (existing) {
          await client.query(
            `UPDATE rate_master
             SET is_active = FALSE,
                 effective_to = CURRENT_DATE,
                 updated_by = $2,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [existing.id, userId],
          );
        }

        if (!sameAmount) {
          const inserted = await client.query(
            `INSERT INTO rate_master (
               category,
               amount,
               effective_from,
               is_active,
               notes,
               created_by,
               updated_by
             )
             VALUES ($1, $2, CURRENT_DATE, TRUE, $3, $4, $4)
             RETURNING
               id,
               category,
               amount,
               effective_from::text AS effective_from,
               effective_to::text AS effective_to,
               is_active,
               notes,
               created_at,
               updated_at`,
            [item.category, item.amount, item.notes || null, userId],
          );
          saved.push(mapRate(inserted.rows[0]));
        }
      }
      /* eslint-enable no-await-in-loop */

      await client.query('COMMIT');
      return saved;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};

export const dueModel = {
  async create(dueData) {
    const result = await pool.query(
      `INSERT INTO dues (
         vehicle_id,
         rate_master_id,
         due_date,
         amount,
         paid_amount,
         status,
         notes,
         created_by,
         updated_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
       RETURNING id`,
      [
        dueData.vehicle_id,
        dueData.rate_master_id,
        dueData.due_date,
        dueData.amount,
        dueData.paid_amount,
        dueData.status,
        dueData.notes,
        dueData.created_by,
      ],
    );

    return this.findById(result.rows[0].id);
  },

  async findById(id) {
    const result = await pool.query(`${dueSelect} WHERE d.id = $1`, [id]);
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
      filters.push(`d.vehicle_id = $${params.length}`);
    }

    if (status) {
      params.push(status);
      filters.push(`d.status = $${params.length}`);
    }

    if (fromDate) {
      params.push(fromDate);
      filters.push(`d.due_date >= $${params.length}`);
    }

    if (toDate) {
      params.push(toDate);
      filters.push(`d.due_date <= $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        `${dueSelect}
         ${whereClause}
         ORDER BY d.due_date DESC, d.created_at DESC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      ),
      pool.query(
        `SELECT COUNT(*)::int AS total
         FROM dues d
         ${whereClause}`,
        params,
      ),
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
    const filters = [openDueFilter];

    if (vehicleId) {
      params.push(vehicleId);
      filters.push(`d.vehicle_id = $${params.length}`);
    }

    if (fromDate) {
      params.push(fromDate);
      filters.push(`d.due_date >= $${params.length}`);
    }

    if (toDate) {
      params.push(toDate);
      filters.push(`d.due_date <= $${params.length}`);
    }

    const result = await pool.query(
      `SELECT
         COALESCE(SUM(d.amount), 0) AS total_due,
         COALESCE(SUM(d.paid_amount), 0) AS total_paid
       FROM dues d
       WHERE ${filters.join(' AND ')}`,
      params,
    );

    return mapOutstanding(result.rows[0].total_due, result.rows[0].total_paid);
  },

  async summarizeByVehicle(vehicleId = null) {
    const params = [];
    let vehicleFilter = '';

    if (vehicleId) {
      params.push(vehicleId);
      vehicleFilter = `WHERE v.id = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT
         v.id AS vehicle_id,
         v.vehicle_number,
         v.owner_name,
         v.category,
         v.status AS vehicle_status,
         COALESCE(SUM(d.amount) FILTER (WHERE ${openDueFilter}), 0) AS total_due,
         COALESCE(SUM(d.paid_amount) FILTER (WHERE ${openDueFilter}), 0) AS total_paid
       FROM vehicles v
       LEFT JOIN dues d ON d.vehicle_id = v.id
       ${vehicleFilter}
       GROUP BY v.id
       ORDER BY v.vehicle_number ASC`,
      params,
    );

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
    const result = await pool.query(
      `UPDATE dues
       SET vehicle_id = $2,
           due_date = $3,
           amount = $4,
           paid_amount = $5,
           status = $6,
           notes = $7,
           updated_by = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id`,
      [
        id,
        dueData.vehicle_id,
        dueData.due_date,
        dueData.amount,
        dueData.paid_amount,
        dueData.status,
        dueData.notes,
        dueData.updated_by,
      ],
    );

    if (!result.rows[0]) {
      return null;
    }

    return this.findById(id);
  },

  async cancel(id, { userId, reason }) {
    const result = await pool.query(
      `UPDATE dues
       SET status = 'cancelled',
           cancellation_reason = $2,
           cancelled_at = CURRENT_TIMESTAMP,
           cancelled_by = $3,
           updated_by = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status <> 'cancelled'
       RETURNING id`,
      [id, reason || null, userId],
    );

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
