-- Migration: Initialize migrations tracking table
-- Created at: 2025-01-01T00:00:00.000Z
-- Migration version: 00000000_000000

-- This is the first migration that sets up the migration tracking table itself
BEGIN;

-- Create table to track migrations if it doesn't exist
CREATE TABLE IF NOT EXISTS _migrations (
    version VARCHAR(255) PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    applied_by TEXT
);

-- Add index for faster searches
CREATE INDEX IF NOT EXISTS idx_migrations_applied_at ON _migrations (applied_at);

-- Record this migration
INSERT INTO _migrations (version, name, applied_at)
VALUES ('00000000_000000', 'Initialize migrations tracking table', NOW())
ON CONFLICT (version) DO NOTHING;

COMMIT; 