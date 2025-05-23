#!/usr/bin/env node

/**
 * Migration Creation Script
 * 
 * This script creates a new migration file with a timestamp and description.
 * Usage: node create-migration.js "description of migration"
 */

const fs = require('fs');
const path = require('path');

// Ensure we have a description
if (process.argv.length < 3) {
    console.error('Please provide a migration description');
    console.error('Usage: node create-migration.js "description of migration"');
    process.exit(1);
}

// Get the migration description
const description = process.argv[2];
const sanitizedDescription = description
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

// Create a timestamp for versioning
const timestamp = new Date().toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '_')
    .split('.')[0];

// Migration filename format: YYYYMMDD_HHMMSS_description.sql
const filename = `${timestamp}_${sanitizedDescription}.sql`;

// Path to migrations directory
const migrationsDir = path.resolve(__dirname, '../supabase/migrations');

// Create migrations directory if it doesn't exist
if (!fs.existsSync(migrationsDir)) {
    console.log(`Creating migrations directory: ${migrationsDir}`);
    fs.mkdirSync(migrationsDir, { recursive: true });
}

// Path to the new migration file
const migrationPath = path.join(migrationsDir, filename);

// Migration file template
const migrationTemplate = `-- Migration: ${description}
-- Created at: ${new Date().toISOString()}
-- Migration version: ${timestamp}

-- Up Migration
BEGIN;

-- Add your SQL changes here

-- Record this migration
INSERT INTO _migrations (version, name, applied_at)
VALUES ('${timestamp}', '${description}', NOW())
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- Down Migration (if needed)
/*
BEGIN;

-- Add rollback SQL here

-- Remove this migration from tracking
DELETE FROM _migrations WHERE version = '${timestamp}';

COMMIT;
*/
`;

// Write the migration file
fs.writeFileSync(migrationPath, migrationTemplate);

console.log(`Created migration: ${filename}`);
console.log(`Full path: ${migrationPath}`);
console.log('\nEdit this file to add your migration SQL commands.');
console.log('Then run it using the Supabase migrations system or database-init.js script.'); 