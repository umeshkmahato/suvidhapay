-- Phase 3: Payment collection digitization
-- Tracks individual payments, receipts, and agent collection activities

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_mode') THEN
    CREATE TYPE payment_mode AS ENUM ('cash', 'upi');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed');
  END IF;
END $$;

-- Payments table: Records individual payment transactions
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_mode payment_mode NOT NULL,
  status payment_status NOT NULL DEFAULT 'completed',
  remarks TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_vehicle_id ON payments (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_payments_agent_id ON payments (agent_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);

-- Receipts table: Stores receipt information for audit and customer records
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  vehicle_number VARCHAR(20) NOT NULL,
  owner_name VARCHAR(150) NOT NULL,
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  agent_name VARCHAR(150) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  collection_date DATE NOT NULL,
  payment_mode payment_mode NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_receipts_payment_id ON receipts (payment_id);
CREATE INDEX IF NOT EXISTS idx_receipts_vehicle_id ON receipts (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_receipts_agent_id ON receipts (agent_id);
CREATE INDEX IF NOT EXISTS idx_receipts_collection_date ON receipts (collection_date DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON receipts (receipt_number);

-- Audit logs table: Tracks all collection activities for agents
CREATE TABLE IF NOT EXISTS agent_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action VARCHAR(100) NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  receipt_id UUID REFERENCES receipts(id) ON DELETE SET NULL,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_audit_logs_agent_id ON agent_audit_logs (agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_audit_logs_created_at ON agent_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_audit_logs_action ON agent_audit_logs (action);

