/* eslint-disable import/prefer-default-export */

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

const openDueFilter = "d.status <> 'cancelled'";

export const sql = {
  common: {
    beginTransaction: 'BEGIN',
    commitTransaction: 'COMMIT',
    rollbackTransaction: 'ROLLBACK',
    whereAll: (conditions) => (conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''),
    whereAny: (conditions) => (conditions.length ? `WHERE ${conditions.join(' OR ')}` : ''),
    and: (conditions) => conditions.join(' AND '),
  },
  userModel: {
    findByEmail: 'SELECT * FROM users WHERE email = $1',
    findById: 'SELECT id, email, full_name, mobile_number, role, is_active, created_at, updated_at FROM users WHERE id = $1',
    updateLastLogin: 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
  },
  vehicleModel: {
    findById: `SELECT id, vehicle_number, owner_name, mobile_number, category, address, status, created_at, updated_at
       FROM vehicles
       WHERE id = $1`,
    findByVehicleNumber: 'SELECT * FROM vehicles WHERE vehicle_number = $1',
    create: `INSERT INTO vehicles (
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
    searchByIdentifiers: (whereClause) => `SELECT
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
       WHERE ${whereClause}
       ORDER BY v.created_at DESC`,
    listData: (whereClause, limitPlaceholder, offsetPlaceholder) => `SELECT
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
         LIMIT $${limitPlaceholder} OFFSET $${offsetPlaceholder}`,
    listCount: (whereClause) => `SELECT COUNT(*)::int AS total
         FROM vehicles v
         ${whereClause}`,
    listOptions: `SELECT id, vehicle_number, owner_name, mobile_number, category, status
       FROM vehicles
       ORDER BY vehicle_number ASC
       LIMIT 1000`,
    filters: {
      identifierVehicleNumber: (placeholder) => `v.vehicle_number = $${placeholder}`,
      identifierMobileNumber: (placeholder) => `v.mobile_number = $${placeholder}`,
      listSearch: (placeholder) => `(
        v.vehicle_number ILIKE $${placeholder}
        OR v.owner_name ILIKE $${placeholder}
        OR v.mobile_number ILIKE $${placeholder}
        OR v.address ILIKE $${placeholder}
      )`,
      category: (placeholder) => `v.category = $${placeholder}`,
      status: (placeholder) => `v.status = $${placeholder}`,
    },
  },
  rateModel: {
    listActive: `SELECT
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
    listHistory: `SELECT
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
    findActiveByCategory: `SELECT
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
    lockActiveByCategory: `SELECT id, amount
           FROM rate_master
           WHERE category = $1 AND is_active = TRUE
           FOR UPDATE`,
    updateActiveNotes: `UPDATE rate_master
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
    deactivateActiveRate: `UPDATE rate_master
             SET is_active = FALSE,
                 effective_to = CURRENT_DATE,
                 updated_by = $2,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
    insertActiveRate: `INSERT INTO rate_master (
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
  },
  dueModel: {
    findById: `${dueSelect} WHERE d.id = $1`,
    create: `INSERT INTO dues (
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
    listData: (whereClause, limitPlaceholder, offsetPlaceholder) => `${dueSelect}
         ${whereClause}
         ORDER BY d.due_date DESC, d.created_at DESC
         LIMIT $${limitPlaceholder} OFFSET $${offsetPlaceholder}`,
    listCount: (whereClause) => `SELECT COUNT(*)::int AS total
         FROM dues d
         ${whereClause}`,
    summarize: (filtersClause) => `SELECT
         COALESCE(SUM(d.amount), 0) AS total_due,
         COALESCE(SUM(d.paid_amount), 0) AS total_paid
       FROM dues d
       WHERE ${filtersClause}`,
    summarizeByVehicle: (vehicleFilter) => `SELECT
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
    update: `UPDATE dues
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
    cancel: `UPDATE dues
       SET status = 'cancelled',
           cancellation_reason = $2,
           cancelled_at = CURRENT_TIMESTAMP,
           cancelled_by = $3,
           updated_by = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status <> 'cancelled'
       RETURNING id`,
    fragments: {
      openDueFilter,
    },
    filters: {
      vehicleId: (placeholder) => `d.vehicle_id = $${placeholder}`,
      status: (placeholder) => `d.status = $${placeholder}`,
      fromDate: (placeholder) => `d.due_date >= $${placeholder}`,
      toDate: (placeholder) => `d.due_date <= $${placeholder}`,
      summaryVehicleId: (placeholder) => `v.id = $${placeholder}`,
    },
  },
  paymentModel: {
    create: `INSERT INTO payments (
        vehicle_id, agent_id, amount, payment_mode, status, remarks
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, vehicle_id, agent_id, amount, payment_mode, status, remarks, created_at, updated_at`,
    findById: `SELECT id, vehicle_id, agent_id, amount, payment_mode, status, remarks, created_at, updated_at
       FROM payments
       WHERE id = $1`,
    listData: (whereClause, limitPlaceholder, offsetPlaceholder) => `SELECT
          p.id, p.vehicle_id, p.agent_id, p.amount, p.payment_mode, p.status, p.remarks,
          v.vehicle_number, v.owner_name,
          u.full_name as agent_name,
          p.created_at, p.updated_at
         FROM payments p
         JOIN vehicles v ON p.vehicle_id = v.id
         JOIN users u ON p.agent_id = u.id
         ${whereClause}
         ORDER BY p.created_at DESC
         LIMIT $${limitPlaceholder} OFFSET $${offsetPlaceholder}`,
    listCount: (whereClause) => `SELECT COUNT(*)::int AS total FROM payments p ${whereClause}`,
    filters: {
      vehicleId: (placeholder) => `p.vehicle_id = $${placeholder}`,
      agentId: (placeholder) => `p.agent_id = $${placeholder}`,
      fromDate: (placeholder) => `DATE(p.created_at) >= $${placeholder}`,
      toDate: (placeholder) => `DATE(p.created_at) <= $${placeholder}`,
    },
  },
  receiptModel: {
    create: `INSERT INTO receipts (
        receipt_number, payment_id, vehicle_id, vehicle_number, owner_name,
        agent_id, agent_name, amount, collection_date, payment_mode, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, receipt_number, payment_id, vehicle_id, vehicle_number, owner_name,
        agent_id, agent_name, amount, collection_date, payment_mode, notes, created_at`,
    findById: `SELECT id, receipt_number, payment_id, vehicle_id, vehicle_number, owner_name,
        agent_id, agent_name, amount, collection_date, payment_mode, notes, created_at, updated_at
       FROM receipts
       WHERE id = $1`,
    findByReceiptNumber: `SELECT id, receipt_number, payment_id, vehicle_id, vehicle_number, owner_name,
        agent_id, agent_name, amount, collection_date, payment_mode, notes, created_at, updated_at
       FROM receipts
       WHERE receipt_number = $1`,
    listData: (whereClause, limitPlaceholder, offsetPlaceholder) => `SELECT
          r.id, r.receipt_number, r.payment_id, r.vehicle_id, r.vehicle_number, r.owner_name,
          r.agent_id, r.agent_name, r.amount, r.collection_date, r.payment_mode, r.notes, r.created_at
         FROM receipts r
         ${whereClause}
         ORDER BY r.created_at DESC
         LIMIT $${limitPlaceholder} OFFSET $${offsetPlaceholder}`,
    listCount: (whereClause) => `SELECT COUNT(*)::int AS total FROM receipts r ${whereClause}`,
    filters: {
      vehicleId: (placeholder) => `r.vehicle_id = $${placeholder}`,
      agentId: (placeholder) => `r.agent_id = $${placeholder}`,
      fromDate: (placeholder) => `r.collection_date >= $${placeholder}`,
      toDate: (placeholder) => `r.collection_date <= $${placeholder}`,
    },
  },
  auditLogModel: {
    create: `INSERT INTO agent_audit_logs (
        agent_id, action, vehicle_id, payment_id, receipt_id, details, ip_address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
  },
  adminService: {
    dashboardToday: `SELECT 
          COALESCE(SUM(amount), 0) as total,
          COUNT(*) as count,
          COUNT(DISTINCT vehicle_id) as vehicle_count
        FROM payments 
        WHERE created_at::DATE = CURRENT_DATE 
        AND status = 'completed'`,
    dashboardMonthly: `SELECT 
          COALESCE(SUM(amount), 0) as total,
          COUNT(*) as count
        FROM payments 
        WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
        AND status = 'completed'`,
    dashboardOutstanding: `SELECT 
          COALESCE(SUM(amount - paid_amount), 0) as total,
          COUNT(*) as count
        FROM dues 
        WHERE status IN ('pending', 'partial')`,
    dashboardVehicles: `SELECT 
          COUNT(*) as total,
          category,
          COUNT(*) FILTER (WHERE status = 'active') as active_count
        FROM vehicles
        GROUP BY category
        ORDER BY total DESC`,
    dashboardAgents: `SELECT 
          COUNT(DISTINCT agent_id) as total
        FROM payments 
        WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
        AND status = 'completed'`,
    collectionReportCount: (whereClause) => `SELECT COUNT(*) as total FROM payments p
         JOIN vehicles v ON p.vehicle_id = v.id
         ${whereClause}`,
    collectionReportData: (whereClause, limitPlaceholder, offsetPlaceholder) => `SELECT 
          p.id,
          p.amount,
          p.payment_mode,
          p.status,
          p.created_at,
          v.vehicle_number,
          v.owner_name,
          v.category,
          u.full_name as agent_name,
          r.receipt_number
        FROM payments p
        JOIN vehicles v ON p.vehicle_id = v.id
        JOIN users u ON p.agent_id = u.id
        LEFT JOIN receipts r ON p.id = r.payment_id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT $${limitPlaceholder} OFFSET $${offsetPlaceholder}`,
    vehicleCategoryReport: (dateFilter) => `SELECT 
          v.category,
          COUNT(DISTINCT v.id) as vehicle_count,
          COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'active') as active_vehicles,
          COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'inactive') as inactive_vehicles,
          COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) as total_collected,
          COALESCE(SUM(d.amount - d.paid_amount) FILTER (WHERE d.status IN ('pending', 'partial')), 0) as total_outstanding,
          COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'completed') as payment_count
        FROM vehicles v
        LEFT JOIN payments p ${dateFilter} ON v.id = p.vehicle_id
        LEFT JOIN dues d ON v.id = d.vehicle_id
        GROUP BY v.category
        ORDER BY vehicle_count DESC`,
    agentCollectionCount: (whereClause) => `SELECT COUNT(DISTINCT u.id) as total FROM users u
          LEFT JOIN payments p ${whereClause} ON u.id = p.agent_id
          WHERE u.role = 'collector'`,
    agentCollectionData: (whereClause, limitPlaceholder, offsetPlaceholder) => `SELECT 
           u.id,
           u.full_name,
           u.email,
           u.mobile_number,
           COUNT(DISTINCT p.id) as payment_count,
           COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) as total_collected,
           COUNT(DISTINCT p.vehicle_id) as unique_vehicles,
           MAX(p.created_at) as last_collection
         FROM users u
         LEFT JOIN payments p ${whereClause} ON u.id = p.agent_id
         WHERE u.role = 'collector'
         GROUP BY u.id, u.full_name, u.email, u.mobile_number
         ORDER BY total_collected DESC
         LIMIT $${limitPlaceholder} OFFSET $${offsetPlaceholder}`,
    dailyCollectionChart: `SELECT 
          DATE(p.created_at) as collection_date,
          COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) as amount,
          COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'completed') as count
        FROM payments p
        WHERE p.created_at >= CURRENT_DATE - INTERVAL '1 day' * $1
        GROUP BY DATE(p.created_at)
        ORDER BY collection_date ASC`,
    monthlyCollectionChart: `SELECT 
          DATE_TRUNC('month', p.created_at)::DATE as month,
          COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) as amount,
          COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'completed') as count
        FROM payments p
        WHERE p.created_at >= CURRENT_DATE - INTERVAL '1 month' * $1
        GROUP BY DATE_TRUNC('month', p.created_at)
        ORDER BY month ASC`,
    exportCollectionData: (whereClause) => `SELECT 
          p.id,
          p.amount,
          p.payment_mode,
          p.status,
          p.created_at,
          v.vehicle_number,
          v.owner_name,
          v.category,
          u.full_name as agent_name,
          r.receipt_number
        FROM payments p
        JOIN vehicles v ON p.vehicle_id = v.id
        JOIN users u ON p.agent_id = u.id
        LEFT JOIN receipts r ON p.id = r.payment_id
        ${whereClause}
        ORDER BY p.created_at DESC`,
    filters: {
      createdAtBetween: (fromPlaceholder, toPlaceholder) => `p.created_at::DATE BETWEEN $${fromPlaceholder}::DATE AND $${toPlaceholder}::DATE`,
      category: (placeholder) => `v.category = $${placeholder}`,
      agentId: (placeholder) => `p.agent_id = $${placeholder}`,
      paymentJoinDateFilter: (fromPlaceholder, toPlaceholder) => `WHERE p.created_at::DATE BETWEEN $${fromPlaceholder}::DATE AND $${toPlaceholder}::DATE`,
    },
  },
};
