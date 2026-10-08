-- Phase 2: category rate master and vehicle dues.
-- Due amounts are copied from the active rate at creation time so later rate
-- changes do not rewrite historical charges. Cancelled dues are retained.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'due_status') THEN
    CREATE TYPE due_status AS ENUM ('pending', 'partial', 'paid', 'cancelled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS rate_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category vehicle_category NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT rate_master_effective_range CHECK (
    effective_to IS NULL OR effective_to >= effective_from
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_master_one_active_category
  ON rate_master (category)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_rate_master_category_created
  ON rate_master (category, created_at DESC);

CREATE TABLE IF NOT EXISTS dues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  rate_master_id UUID REFERENCES rate_master(id) ON DELETE RESTRICT,
  due_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  status due_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP,
  cancelled_by UUID REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT dues_paid_not_above_amount CHECK (paid_amount <= amount),
  CONSTRAINT dues_cancel_metadata CHECK (
    (
      status = 'cancelled'
      AND cancelled_at IS NOT NULL
      AND cancelled_by IS NOT NULL
    )
    OR (
      status <> 'cancelled'
      AND cancelled_at IS NULL
      AND cancelled_by IS NULL
    )
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_dues_vehicle_date_open
  ON dues (vehicle_id, due_date)
  WHERE status <> 'cancelled';

CREATE INDEX IF NOT EXISTS idx_dues_vehicle_id ON dues (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_dues_due_date ON dues (due_date DESC);
CREATE INDEX IF NOT EXISTS idx_dues_status ON dues (status);
CREATE INDEX IF NOT EXISTS idx_dues_created_at ON dues (created_at DESC);

