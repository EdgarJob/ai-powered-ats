#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script applies all database schema changes in the correct order.
 * It should be run once to initialize the local Supabase database.
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

// SQL scripts to execute in order
const sqlScripts = [
    '../fix-db-schema.sql',
    '../fix-auth.sql',
    '../fix-relationships.sql',
    '../fix-candidates-jobs.sql',
    '../add-responsibilities-column.sql',
    '../add-metadata-column.sql',
    '../fix_resume_urls.sql',
    '../implement_cv_versions.sql',
    '../create_job_applications.sql'
];

/**
 * Execute a SQL script
 */
async function executeScript(scriptPath) {
    try {
        // Read the SQL file
        const fullPath = path.resolve(__dirname, scriptPath);
        console.log(`Reading SQL script: ${fullPath}`);

        if (!fs.existsSync(fullPath)) {
            console.warn(`Script file not found: ${fullPath}`);
            return { success: false, error: 'File not found' };
        }

        const sqlContent = fs.readFileSync(fullPath, 'utf8');

        // Execute the SQL using RPC call (if available)
        try {
            console.log(`Executing SQL script: ${path.basename(scriptPath)}`);
            const { data, error } = await supabase.rpc('execute_sql', {
                sql: sqlContent
            });

            if (error) {
                console.error(`Error executing SQL via RPC: ${error.message}`);
                return { success: false, error: error.message };
            }

            console.log(`Successfully executed SQL script: ${path.basename(scriptPath)}`);
            return { success: true };
        } catch (rpcError) {
            console.error(`RPC execution failed, may not be available: ${rpcError.message}`);
            console.log(`Please run this script manually using the Supabase SQL editor.`);
            return { success: false, error: rpcError.message, manual: true };
        }
    } catch (error) {
        console.error(`Error executing script ${scriptPath}:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Main execution function
 */
async function initializeDatabase() {
    console.log('Starting database initialization...');
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

    // Execute all SQL scripts in order
    const results = [];
    let manualScripts = [];

    for (const script of sqlScripts) {
        const result = await executeScript(script);
        results.push({ script, ...result });

        if (result.manual) {
            manualScripts.push(script);
        }
    }

    // Print summary
    console.log('\n=== Database Initialization Summary ===');

    const successCount = results.filter(r => r.success).length;
    console.log(`Successfully executed: ${successCount}/${sqlScripts.length} scripts`);

    if (manualScripts.length > 0) {
        console.log('\nThe following scripts need to be executed manually:');
        manualScripts.forEach(script => {
            console.log(`- ${script}`);
        });
        console.log('\nPlease run these scripts in the Supabase SQL editor.');
    }

    if (successCount === sqlScripts.length) {
        console.log('\nDatabase initialization completed successfully!');
    } else {
        console.log('\nDatabase initialization completed with some issues.');
        console.log('Please check the logs above for details.');
    }
}

// Run the initialization
initializeDatabase()
    .catch(error => {
        console.error('Uncaught error during database initialization:', error);
        process.exit(1);
    }); 