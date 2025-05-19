// Script to check the admin user in the Supabase database
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fetch from 'cross-fetch';

// Polyfill fetch
global.fetch = fetch;

// Load environment variables
dotenv.config();

// Set Supabase URL and key
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('Checking admin user in Supabase at URL:', supabaseUrl);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkAdminUser() {
    try {
        // Try to sign in with admin credentials
        console.log('Attempting to sign in as admin...');

        // Check users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'admin');

        if (userError) {
            console.error('Error querying users table:', userError);
        } else {
            console.log('Admin users found in public.users table:', userData);
        }

        // Try to sign in
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'admin@example.com',
            password: 'admin123'
        });

        if (authError) {
            console.error('Admin login error:', authError);
        } else {
            console.log('Admin login successful!', {
                id: authData.user.id,
                email: authData.user.email,
                session: authData.session ? 'Valid session' : 'No session'
            });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

// Run the check
checkAdminUser(); 