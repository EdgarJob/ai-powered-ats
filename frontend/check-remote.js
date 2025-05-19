// Simple script to check connection to remote Supabase instance
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fetch from 'cross-fetch';
import { randomUUID } from 'crypto';

// Polyfill fetch
global.fetch = fetch;

// Load environment variables
dotenv.config();

// Set Supabase URL and key
const supabaseUrl = 'https://pdfgnqutqreluoetvfdh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZmducXV0cXJlbHVvZXR2ZmRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMzY1MDQ5MCwiZXhwIjoyMDI5MjI2NDkwfQ.s3HPUX4NN_mP0ZsfQz5rU7j1TmZ-Mzs72TH_tShW1GI';

console.log('Checking connection to Supabase at URL:', supabaseUrl);

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

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

// Run the check
checkConnection(); 