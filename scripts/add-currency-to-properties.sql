-- Migration: Add missing columns to properties table
-- Run this in your Supabase SQL editor

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS description   TEXT,
  ADD COLUMN IF NOT EXISTS amenities     TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS images        TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "floorPlans"  JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS currency      TEXT     NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'NGN'));

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'properties'
  AND column_name IN ('description','amenities','images','floorPlans','currency');
