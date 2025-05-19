/**
 * Script to check jobs in the database
 */

require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

// Config
const config = {
    supabaseUrl: process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
    supabaseServiceKey: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
};

// Create Supabase admin client
const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
);

async function main() {
    try {
        console.log('Checking jobs in the database...');
        console.log('Supabase URL:', config.supabaseUrl);

        // 1. First, check if the jobs table exists
        const { data: tablesData, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');

        if (tablesError) {
            throw new Error(`Error listing tables: ${tablesError.message}`);
        }

        console.log(`Found ${tablesData.length} tables in public schema:`);
        tablesData.forEach(t => console.log(`- ${t.table_name}`));

        const jobsTableExists = tablesData.some(t => t.table_name === 'jobs');
        if (!jobsTableExists) {
            console.log('❌ Jobs table does not exist!');
            return;
        }

        console.log('✅ Jobs table exists');

        // 2. Check the structure of the jobs table
        const { data: columnsData, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type')
            .eq('table_schema', 'public')
            .eq('table_name', 'jobs');

        if (columnsError) {
            throw new Error(`Error getting jobs table structure: ${columnsError.message}`);
        }

        console.log(`Jobs table has ${columnsData.length} columns:`);
        columnsData.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));

        // 3. Get all jobs in the database
        const { data: allJobs, error: allJobsError } = await supabase
            .from('jobs')
            .select('*');

        if (allJobsError) {
            throw new Error(`Error fetching all jobs: ${allJobsError.message}`);
        }

        console.log(`Total jobs in database: ${allJobs.length}`);

        // 4. Get all published jobs
        const { data: publishedJobs, error: publishedJobsError } = await supabase
            .from('jobs')
            .select('id, title, status, created_at')
            .eq('status', 'published');

        if (publishedJobsError) {
            throw new Error(`Error fetching published jobs: ${publishedJobsError.message}`);
        }

        console.log(`Published jobs: ${publishedJobs.length}`);
        if (publishedJobs.length > 0) {
            console.log('Published jobs:');
            publishedJobs.forEach(job => {
                console.log(`- ID: ${job.id}, Title: ${job.title}, Created: ${job.created_at}`);
            });
        } else {
            console.log('No published jobs found!');

            // If no published jobs, let's check all the job statuses
            const { data: statusData, error: statusError } = await supabase
                .from('jobs')
                .select('status, count')
                .select('*');

            if (statusError) {
                throw new Error(`Error fetching job statuses: ${statusError.message}`);
            }

            // Group by status
            const statusCounts = {};
            statusData.forEach(job => {
                const status = job.status || 'null';
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });

            console.log('Job status distribution:');
            Object.entries(statusCounts).forEach(([status, count]) => {
                console.log(`- ${status}: ${count}`);
            });

            // Show the first 5 jobs regardless of status
            console.log('Sample of jobs (any status):');
            statusData.slice(0, 5).forEach(job => {
                console.log(`- ID: ${job.id}, Title: ${job.title}, Status: ${job.status}`);
            });
        }

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main(); 