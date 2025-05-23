#!/usr/bin/env node

/**
 * Migration Runner Script
 * 
 * This script runs all pending migrations in the correct order.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Supabase client configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create admin client for database operations
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Path to migrations directory
const migrationsDir = path.resolve(__dirname, '../supabase/migrations');

/**
 * Execute a single SQL migration
 */
async function executeMigration(migrationPath, version) {
    try {
        console.log(`Executing migration: ${path.basename(migrationPath)}`);

        // Read the migration file
        const sqlContent = fs.readFileSync(migrationPath, 'utf8');

        // Execute the SQL using RPC call
        try {
            const { data, error } = await supabase.rpc('execute_sql', {
                sql: sqlContent
            });

            if (error) {
                console.error(`Error executing migration: ${error.message}`);
                return { success: false, error: error.message };
            }

            console.log(`Successfully executed migration: ${path.basename(migrationPath)}`);
            return { success: true };
        } catch (rpcError) {
            console.error(`RPC execution failed: ${rpcError.message}`);
            console.log(`Please run this migration manually using the Supabase SQL editor.`);
            return { success: false, error: rpcError.message, manual: true };
        }
    } catch (error) {
        console.error(`Error executing migration ${path.basename(migrationPath)}:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all applied migrations from the database
 */
async function getAppliedMigrations() {
    try {
        // First, check if the _migrations table exists
        const { data: tableExists, error: tableCheckError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_name', '_migrations')
            .eq('table_schema', 'public')
            .single();

        if (tableCheckError || !tableExists) {
            console.log('Migrations table does not exist yet. Will be created by the first migration.');
            return [];
        }

        // Get all applied migrations
        const { data, error } = await supabase
            .from('_migrations')
            .select('version, applied_at')
            .order('applied_at', { ascending: true });

        if (error) {
            console.error('Error fetching applied migrations:', error.message);
            return [];
        }

        return data.map(m => m.version);
    } catch (error) {
        console.error('Error checking applied migrations:', error);
        return [];
    }
}

/**
 * Main function to run migrations
 */
async function runMigrations() {
    console.log('Starting migration process...');
    console.log(`Using Supabase at: ${supabaseUrl}`);

    // Check if we can connect
    try {
        const { data, error } = await supabase.from('_tables').select('*').limit(1);

        if (error) {
            console.error('Error connecting to Supabase:', error.message);
            console.error('Please ensure your Supabase instance is running and credentials are correct');
            process.exit(1);
        }

        console.log('Successfully connected to Supabase');
    } catch (error) {
        console.error('Failed to connect to Supabase:', error);
        process.exit(1);
    }

    // Get list of all migration files
    if (!fs.existsSync(migrationsDir)) {
        console.error(`Migrations directory does not exist: ${migrationsDir}`);
        process.exit(1);
    }

    let migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort(); // Sort alphabetically which works with our timestamp naming

    console.log(`Found ${migrationFiles.length} migration files`);

    // Get list of already applied migrations
    const appliedMigrations = await getAppliedMigrations();
    console.log(`Found ${appliedMigrations.length} already applied migrations`);

    // Determine which migrations need to be applied
    const pendingMigrations = migrationFiles
        .filter(file => {
            const version = file.split('_')[0] + '_' + file.split('_')[1];
            return !appliedMigrations.includes(version);
        });

    console.log(`Found ${pendingMigrations.length} pending migrations to apply`);

    if (pendingMigrations.length === 0) {
        console.log('No pending migrations to apply.');
        process.exit(0);
    }

    // Apply pending migrations in order
    const results = [];
    let manualMigrations = [];

    for (const migrationFile of pendingMigrations) {
        const migrationPath = path.join(migrationsDir, migrationFile);
        const version = migrationFile.split('_')[0] + '_' + migrationFile.split('_')[1];

        const result = await executeMigration(migrationPath, version);
        results.push({ migration: migrationFile, ...result });

        if (result.manual) {
            manualMigrations.push(migrationFile);
        }

        if (!result.success && !result.manual) {
            console.error(`Migration failed: ${migrationFile}`);
            break; // Stop on first non-manual failure
        }
    }

    // Print summary
    console.log('\n=== Migration Summary ===');

    const successCount = results.filter(r => r.success).length;
    console.log(`Successfully applied: ${successCount}/${pendingMigrations.length} migrations`);

    if (manualMigrations.length > 0) {
        console.log('\nThe following migrations need to be applied manually:');
        manualMigrations.forEach(migration => {
            console.log(`- ${migration}`);
        });
        console.log('\nPlease run these migrations in the Supabase SQL editor.');
    }

    if (successCount === pendingMigrations.length) {
        console.log('\nAll migrations completed successfully!');
    } else {
        console.log('\nMigrations completed with some issues.');
        console.log('Please check the logs above for details.');
    }
}

// Run the migrations
runMigrations()
    .catch(error => {
        console.error('Uncaught error during migration process:', error);
        process.exit(1);
    }); 