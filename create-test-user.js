// Script to create a new test user with a unique email
const { createClient } = require('@supabase/supabase-js');

// Supabase connection details
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createUniqueTestUser() {
    try {
        // Generate a unique email
        const uniqueEmail = `test_${Date.now()}@example.com`;
        const testPassword = 'password123';

        console.log(`Creating new test user with email ${uniqueEmail}...`);

        // Create a new user
        const { data, error: createError } = await supabase.auth.admin.createUser({
            email: uniqueEmail,
            password: testPassword,
            email_confirm: true
        });

        if (createError) {
            console.error('Error creating user:', createError);
            return;
        }

        console.log('User created successfully:', data);

        if (!data || !data.user || !data.user.id) {
            console.error('Invalid user data returned:', data);
            return;
        }

        const userId = data.user.id;
        console.log('User ID:', userId);

        // Get default organization
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id')
            .limit(1)
            .single();

        if (orgError) {
            console.error('Error getting default organization:', orgError);
            return;
        }

        console.log('Using organization:', orgData.id);

        // Add user to public.users table with member role
        const { error: insertError } = await supabase
            .from('users')
            .insert({
                id: userId,
                role: 'member',
                org_id: orgData.id
            });

        if (insertError) {
            console.error('Error adding user to public.users table:', insertError);
            return;
        }

        console.log('User added to public.users table with member role.');

        // Display test credentials
        console.log('\nTEST USER CREDENTIALS:');
        console.log(`Email: ${uniqueEmail}`);
        console.log(`Password: ${testPassword}`);
        console.log('Role: member');
        console.log('User ID:', userId);

        // Try to authenticate with the new user
        console.log('\nTesting authentication with new user...');
        const authClient = createClient(SUPABASE_URL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0');

        const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
            email: uniqueEmail,
            password: testPassword
        });

        if (authError) {
            console.error('Authentication test failed:', authError);
        } else {
            console.log('Authentication successful! User can log in.');
            console.log('Token:', authData.session?.access_token ? 'Available' : 'Not available');
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

// Call the function
createUniqueTestUser(); 