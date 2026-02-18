-- Migration: Add currency column to properties table
-- Run this in your Supabase SQL editor

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD'
CHECK (currency IN ('USD', 'NGN'));

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'properties' AND column_name = 'currency';
