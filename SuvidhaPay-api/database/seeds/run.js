import bcrypt from 'bcrypt';
import pool from '../../src/config/database.js';

async function seedDatabase() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash('Admin@123', 10);
    // Create admin users (2)
    const admin1 = await client.query(
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

     const admin2 = await client.query(
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
       ['admin2@municipal.com', passwordHash, 'Senior Administrator', '9999999998', 'admin'],
     );

     // Create collector users (2)
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
          ['agent@municipal.com', passwordHash, 'Municipal Admin', '9999999999', 'agent'],
      );
     const collector1 = await client.query(
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
       ['collector@municipal.com', passwordHash, 'Field Collector', '8888888888', 'collector'],
     );

     const collector2 = await client.query(
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
       ['collector2@municipal.com', passwordHash, 'Revenue Collector', '8888888887', 'collector'],
     );

     // Create officer users (2)
     const officer1 = await client.query(
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
       ['officer@municipal.com', passwordHash, 'Collection Officer', '7777777777', 'officer'],
     );

     const officer2 = await client.query(
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
       ['officer2@municipal.com', passwordHash, 'Senior Officer', '7777777776', 'officer'],
     );

     // Create vendor users (2)
     const vendor1 = await client.query(
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
       ['vendor@municipal.com', passwordHash, 'Auto Rickshaw Vendor', '6666666666', 'vendor'],
     );

     const vendor2 = await client.query(
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
       ['vendor2@municipal.com', passwordHash, 'E-Rickshaw Vendor', '6666666665', 'vendor'],
     );

     const adminId = admin1.rows[0].id;
     const collectorId = collector1.rows[0].id;
     const officerId = officer1.rows[0].id;
     const vendorId = vendor1.rows[0].id;

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
       ['MH12EF9012', 'Shyam Hawker', '9876543212', 'hawker', 'Ward 8, Pune', 'inactive', collectorId],
     );

    const insertRate = async (category, amount) => {
      await client.query(
        `INSERT INTO rate_master (category, amount, effective_from, is_active, created_by, updated_by)
         SELECT $1, $2, CURRENT_DATE, TRUE, $3, $3
         WHERE NOT EXISTS (
           SELECT 1 FROM rate_master WHERE category = $1 AND is_active = TRUE
         )`,
        [category, amount, adminId],
      );
    };

    await insertRate('auto', 50);
    await insertRate('e_rickshaw', 30);
    await insertRate('hawker', 20);

    const insertDue = async ({
      vehicleNumber,
      dueDate,
      status,
      paidAmount,
      category,
    }) => {
      await client.query(
        `INSERT INTO dues (
           vehicle_id,
           rate_master_id,
           due_date,
           amount,
           paid_amount,
           status,
           notes,
           cancellation_reason,
           cancelled_at,
           cancelled_by,
           created_by,
           updated_by
         )
         SELECT
           v.id,
           r.id,
           $2::date,
           r.amount,
           $3::numeric,
           $4::due_status,
           $5,
           CASE WHEN $4::text = 'cancelled' THEN 'Seeded historical cancellation' ELSE NULL END,
           CASE WHEN $4::text = 'cancelled' THEN CURRENT_TIMESTAMP ELSE NULL END,
           CASE WHEN $4::text = 'cancelled' THEN $6::uuid ELSE NULL END,
           $6::uuid,
           $6::uuid
         FROM vehicles v
         JOIN rate_master r ON r.category = v.category AND r.is_active = TRUE
         WHERE v.vehicle_number = $1
           AND r.category = $7::vehicle_category
           AND NOT EXISTS (
             SELECT 1
             FROM dues d
             WHERE d.vehicle_id = v.id
               AND d.due_date = $2::date
               AND d.status = $4::due_status
           )`,
        [vehicleNumber, dueDate, paidAmount, status, 'Seeded Phase 2 due', adminId, category],
      );
    };

    await insertDue({
      vehicleNumber: 'MH12AB1234',
      dueDate: '2026-10-01',
      status: 'pending',
      paidAmount: 0,
      category: 'auto',
    });
    await insertDue({
      vehicleNumber: 'MH12AB1234',
      dueDate: '2026-09-01',
      status: 'paid',
      paidAmount: 50,
      category: 'auto',
    });
    await insertDue({
      vehicleNumber: 'MH12AB1234',
      dueDate: '2026-08-01',
      status: 'cancelled',
      paidAmount: 0,
      category: 'auto',
    });
    await insertDue({
      vehicleNumber: 'MH12CD5678',
      dueDate: '2026-10-01',
      status: 'partial',
      paidAmount: 10,
      category: 'e_rickshaw',
    });

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
