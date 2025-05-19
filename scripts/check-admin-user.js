/**
 * Script to check the admin user in the database
 */

require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

// Config - Use the same credentials as in the create-admin-user.js script
const config = {
    supabaseUrl: process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
    supabaseServiceKey: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
    // The email used during admin creation
    adminEmail: 'admin@example.com'
};

// Create Supabase admin client
const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
);

async function main() {
    try {
        console.log('Checking admin user...');

        // 1. Find the auth user
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            throw new Error(`Error listing users: ${authError.message}`);
        }

        console.log(`Found ${authData.users.length} users in auth system.`);

        // Find our admin user
        const adminUser = authData.users.find(user => user.email === config.adminEmail);

        if (!adminUser) {
            console.log(`Admin user with email ${config.adminEmail} not found in auth system!`);
            return;
        }

        console.log(`Found admin auth user: ${adminUser.id} (${adminUser.email})`);

        // 2. Check the users table to see if the user has the admin role
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', adminUser.id);

        if (userError) {
            throw new Error(`Error fetching user record: ${userError.message}`);
        }

        if (userData.length === 0) {
            console.log(`User record not found in users table for ID: ${adminUser.id}`);
            return;
        }

        console.log('User record:');
        console.log(userData[0]);

        if (userData[0].role === 'admin') {
            console.log('✅ User has admin role.');
        } else {
            console.log(`❌ User does NOT have admin role! Current role: ${userData[0].role}`);

            // Attempt to fix the role
            console.log('Attempting to update role to admin...');
            const { data: updateData, error: updateError } = await supabase
                .from('users')
                .update({ role: 'admin' })
                .eq('id', adminUser.id)
                .select();

            if (updateError) {
                console.error('Error updating role:', updateError);
            } else {
                console.log('✅ Role updated successfully!', updateData);
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main(); 