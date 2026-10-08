import bcrypt from 'bcrypt';
import pool from '../../src/config/database.js';

async function seedDatabase() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash('Admin@123', 10);

    const admin = await client.query(
      `INSERT INTO users (email, password_hash, full_name, mobile_number, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           full_name = EXCLUDED.full_name,
           mobile_number = EXCLUDED.mobile_number,
           role = EXCLUDED.role,
           is_active = TRUE,
           updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      ['admin@municipal.com', passwordHash, 'Municipal Admin', '9999999999', 'admin'],
    );

    const agent = await client.query(
      `INSERT INTO users (email, password_hash, full_name, mobile_number, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           full_name = EXCLUDED.full_name,
           mobile_number = EXCLUDED.mobile_number,
           role = EXCLUDED.role,
           is_active = TRUE,
           updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      ['agent@municipal.com', passwordHash, 'Field Agent', '8888888888', 'agent'],
    );

    const adminId = admin.rows[0].id;
    const agentId = agent.rows[0].id;

    await client.query(
      `INSERT INTO vehicles (
         vehicle_number, owner_name, mobile_number, category, address, status, created_by, updated_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
       ON CONFLICT (vehicle_number) DO UPDATE
       SET owner_name = EXCLUDED.owner_name,
           mobile_number = EXCLUDED.mobile_number,
           category = EXCLUDED.category,
           address = EXCLUDED.address,
           status = EXCLUDED.status,
           updated_by = EXCLUDED.updated_by,
           updated_at = CURRENT_TIMESTAMP`,
      ['MH12AB1234', 'Ramesh Auto', '9876543210', 'auto', 'Ward 1, Pune', 'active', adminId],
    );

    await client.query(
      `INSERT INTO vehicles (
         vehicle_number, owner_name, mobile_number, category, address, status, created_by, updated_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
       ON CONFLICT (vehicle_number) DO UPDATE
       SET owner_name = EXCLUDED.owner_name,
           mobile_number = EXCLUDED.mobile_number,
           category = EXCLUDED.category,
           address = EXCLUDED.address,
           status = EXCLUDED.status,
           updated_by = EXCLUDED.updated_by,
           updated_at = CURRENT_TIMESTAMP`,
      ['MH12CD5678', 'Sita E-Rickshaw', '9876543211', 'e_rickshaw', 'Ward 4, Pune', 'active', adminId],
    );

    await client.query(
      `INSERT INTO vehicles (
         vehicle_number, owner_name, mobile_number, category, address, status, created_by, updated_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
       ON CONFLICT (vehicle_number) DO UPDATE
       SET owner_name = EXCLUDED.owner_name,
           mobile_number = EXCLUDED.mobile_number,
           category = EXCLUDED.category,
           address = EXCLUDED.address,
           status = EXCLUDED.status,
           updated_by = EXCLUDED.updated_by,
           updated_at = CURRENT_TIMESTAMP`,
      ['MH12EF9012', 'Shyam Hawker', '9876543212', 'hawker', 'Ward 8, Pune', 'inactive', agentId],
    );

    await client.query('COMMIT');
    console.log('Seed data inserted or updated');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

await seedDatabase();
