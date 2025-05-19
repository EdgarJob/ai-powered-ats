// Simple script to test Supabase authentication
const { createClient } = require('@supabase/supabase-js');

// Supabase connection details (same as in your app)
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create Supabase clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testAuth() {
    console.log('Testing Supabase Authentication...');

    try {
        // 1. First check connection to Supabase
        const { data: connectionTest, error: connectionError } = await supabaseAdmin
            .from('users')
            .select('count')
            .limit(1);

        if (connectionError) {
            console.error('Error connecting to Supabase:', connectionError);
            return;
        }

        console.log('Connection test successful:', connectionTest);

        // 2. Test authentication with admin@example.com
        const email = 'admin@example.com';
        const password = 'admin123';

        console.log(`Attempting to authenticate with ${email}...`);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Authentication error:', error);
        } else {
            console.log('Authentication successful!');
            console.log('Session:', data.session ? 'Available' : 'Not available');
            console.log('User:', data.user.email);

            if (data.user) {
                // Fetch user role from the database
                const { data: userData, error: userError } = await supabaseAdmin
                    .from('users')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                if (userError) {
                    console.error('Error fetching user role:', userError);
                } else {
                    console.log('User role:', userData.role);
                }
            }
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

// Run the test
testAuth(); 