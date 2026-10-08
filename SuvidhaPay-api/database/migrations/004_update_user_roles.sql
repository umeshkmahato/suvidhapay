-- Update user_role enum to include all 4 roles
-- This migration safely handles the enum type update

DO $$
BEGIN
  -- Add the new enum values if they don't exist
  BEGIN
    ALTER TYPE user_role ADD VALUE 'collector' BEFORE 'agent';
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  BEGIN
    ALTER TYPE user_role ADD VALUE 'officer' BEFORE 'agent';
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  BEGIN
    ALTER TYPE user_role ADD VALUE 'vendor' AFTER 'agent';
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

