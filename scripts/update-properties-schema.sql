-- Add new columns to properties table for enhanced listings
-- Using camelCase with quotes to match existing schema style ("priceLabel", "createdAt")
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "floorPlans" JSONB DEFAULT '[]';

-- Update existing rows to have empty arrays instead of nulls if needed
UPDATE properties SET images = '{}' WHERE images IS NULL;
UPDATE properties SET amenities = '{}' WHERE amenities IS NULL;
UPDATE properties SET "floorPlans" = '[]' WHERE "floorPlans" IS NULL;
