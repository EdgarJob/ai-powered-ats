// Script to check connection to the local Supabase instance
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
require('dotenv').config();

// Set Supabase URL and key - using local connection
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

console.log('Checking connection to local Supabase at URL:', supabaseUrl);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkConnection() {
    try {
        // Check if we can connect to Supabase
        const { data, error } = await supabase.from('jobs').select('count');

        if (error) {
            console.error('Error connecting to Supabase:', error);
            return;
        }

        console.log('Successfully connected to Supabase!');
        console.log('Response data:', data);

        // Try to create a test organization
        const orgName = `Test Org ${new Date().toISOString()}`;
        const orgId = randomUUID();

        console.log(`Creating test organization "${orgName}" with ID: ${orgId}`);

        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .insert([
                { id: orgId, name: orgName }
            ])
            .select();

        if (orgError) {
            console.error('Error creating organization:', orgError);
        } else {
            console.log('Organization created successfully:', orgData);
        }

        // Create a test job
        const jobTitle = `Test Job ${new Date().toISOString()}`;
        const jobId = randomUUID();

        console.log(`Creating test job "${jobTitle}" with ID: ${jobId}`);

        const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .insert([
                {
                    id: jobId,
                    org_id: orgId,
                    title: jobTitle,
                    description: 'This is a test job description',
                    requirements: ['Test skill 1', 'Test skill 2'],
                    status: 'published',
                    created_by: orgId
                }
            ])
            .select();

        if (jobError) {
            console.error('Error creating job:', jobError);
        } else {
            console.log('Job created successfully:', jobData);
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

checkConnection(); 