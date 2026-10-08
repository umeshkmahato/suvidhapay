# Database Schema Documentation

## Overview

SuvidhaPay database is built on PostgreSQL with a comprehensive schema supporting municipal collection management.

## Tables & Relationships

### 1. Users Table
Stores user account information with role-based access control.

```sql
users (
  id: UUID,
  email: VARCHAR (unique),
  phone: VARCHAR (unique),
  first_name: VARCHAR,
  last_name: VARCHAR,
  password_hash: VARCHAR,
  role: user_role (admin | collector | officer | vendor),
  is_active: BOOLEAN,
  last_login: TIMESTAMP,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
)
```

**Roles:**
- **Admin**: Full access, can manage users and vendors
- **Collector**: Can record collections and payments
- **Officer**: Can view reports and analytics
- **Vendor**: Can view their own data

### 2. Vendors Table
Stores information about vendors (Auto, E-Rickshaw, Hawkers, Vendors).

```sql
vendors (
  id: UUID,
  name: VARCHAR,
  vendor_type: vendor_type (auto | e_rickshaw | hawker | vendor),
  email: VARCHAR,
  phone: VARCHAR,
  registration_number: VARCHAR (unique),
  address: TEXT,
  city: VARCHAR,
  state: VARCHAR,
  pincode: VARCHAR,
  license_number: VARCHAR,
  license_expiry: DATE,
  status: VARCHAR,
  outstanding_amount: DECIMAL,
  notes: TEXT,
  created_at: TIMESTAMP,
  created_by: UUID (FK to users)
)
```

### 3. Collections Table
Records daily collection activities.

```sql
collections (
  id: UUID,
  vendor_id: UUID (FK),
  collector_id: UUID (FK to users),
  collection_date: DATE,
  amount_due: DECIMAL,
  amount_collected: DECIMAL,
  payment_status: payment_status (pending | partial | completed | overdue),
  collection_status: collection_status (scheduled | in_progress | completed | cancelled),
  payment_method: VARCHAR,
  reference_number: VARCHAR,
  next_collection_due: DATE,
  created_at: TIMESTAMP
)
```

### 4. Payments Table
Tracks individual payment transactions.

```sql
payments (
  id: UUID,
  collection_id: UUID (FK),
  vendor_id: UUID (FK),
  payment_date: TIMESTAMP,
  amount: DECIMAL,
  payment_method: VARCHAR,
  transaction_id: VARCHAR,
  receipt_number: VARCHAR (unique),
  notes: TEXT,
  created_at: TIMESTAMP,
  created_by: UUID (FK to users)
)
```

### 5. Receipts Table
Stores receipt information for audit and customer records.

```sql
receipts (
  id: UUID,
  payment_id: UUID (FK),
  receipt_number: VARCHAR (unique),
  vendor_id: UUID (FK),
  collector_id: UUID (FK),
  amount: DECIMAL,
  issue_date: TIMESTAMP,
  notes: TEXT,
  created_at: TIMESTAMP
)
```

### 6. Audit Logs Table
Maintains comprehensive audit trail of all operations.

```sql
audit_logs (
  id: UUID,
  user_id: UUID (FK),
  action: VARCHAR,
  entity_type: VARCHAR,
  entity_id: UUID,
  old_values: JSONB,
  new_values: JSONB,
  ip_address: VARCHAR,
  user_agent: TEXT,
  created_at: TIMESTAMP
)
```

## Indexes

Optimized indexes for performance:

- `idx_users_email` - Fast user lookup by email
- `idx_users_phone` - Fast user lookup by phone
- `idx_vendors_registration_number` - Unique vendor registration lookup
- `idx_collections_vendor_id` - Find collections by vendor
- `idx_collections_collection_date` - Date range queries
- `idx_payments_payment_date` - Payment date range queries
- `idx_audit_logs_created_at` - Audit log time series queries

## Enums

```sql
user_role: admin | collector | officer | vendor
vendor_type: auto | e_rickshaw | hawker | vendor
payment_status: pending | partial | completed | overdue
collection_status: scheduled | in_progress | completed | cancelled
```

## Entity Relationships

```
users (1) ──→ (N) vendors (created_by)
users (1) ──→ (N) collections (collector_id)
users (1) ──→ (N) audit_logs (user_id)

vendors (1) ──→ (N) collections
vendors (1) ──→ (N) payments
vendors (1) ──→ (N) receipts

collections (1) ──→ (N) payments
collections (1) ──→ (1) receipts (via payment_id)
```

## Sample Queries

### Get all collections for a vendor
```sql
SELECT * FROM collections
WHERE vendor_id = 'vendor-uuid'
ORDER BY collection_date DESC;
```

### Get outstanding collections
```sql
SELECT v.name, SUM(c.amount_due - c.amount_collected) as outstanding
FROM collections c
JOIN vendors v ON c.vendor_id = v.id
WHERE c.payment_status IN ('pending', 'partial', 'overdue')
GROUP BY v.id, v.name;
```

### Daily collection report
```sql
SELECT 
  DATE(collection_date) as collection_day,
  COUNT(*) as total_collections,
  SUM(amount_collected) as total_collected,
  SUM(amount_due) as total_due
FROM collections
WHERE collection_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(collection_date)
ORDER BY collection_day DESC;
```

### Vendor payment history
```sql
SELECT 
  v.name,
  p.payment_date,
  p.amount,
  p.receipt_number
FROM payments p
JOIN vendors v ON p.vendor_id = v.id
WHERE v.id = 'vendor-uuid'
ORDER BY p.payment_date DESC;
```

## Security

- ✅ Primary keys use UUID (not sequential IDs)
- ✅ Audit log JSONB for flexible audit trail
- ✅ Foreign key constraints with CASCADE deletes
- ✅ Role-based access control via user roles
- ✅ Timestamp tracking for all records
- ✅ Indexes for query optimization
