-- Add responsibilities column to jobs table if it doesn't exist
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS responsibilities TEXT; 