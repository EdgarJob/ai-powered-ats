/**
 * Script to create an admin user for the AI Powered ATS
 * 
 * To run:
 * 1. Update the config values below
 * 2. Run: node create-admin-user.js
 */

require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

// Config - Update these values before running
const config = {
    // Get these from your .env file or Supabase dashboard
    supabaseUrl: process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
    supabaseServiceKey: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,

    // Admin user details - CHANGE THESE!
    adminEmail: 'admin@example.com',     // Change this to your admin email
    adminPassword: 'admin', // Change this to a secure password
    organizationName: 'Default Organization',
}

// Validate required config
if (!config.supabaseServiceKey) {
    console.error('Error: VITE_SUPABASE_SERVICE_ROLE_KEY is required. Check your .env file.');
    process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
);

async function main() {
    try {
        console.log('Creating admin user...');

        // 1. Create a new user with auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: config.adminEmail,
            password: config.adminPassword,
            email_confirm: true,
        });

        if (authError) {
            throw new Error(`Error creating user: ${authError.message}`);
        }

        console.log(`Authentication user created with id: ${authData.user.id}`);
        const userId = authData.user.id;

        // 2. Create organization
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .insert({
                name: config.organizationName,
            })
            .select()
            .single();

        if (orgError) {
            throw new Error(`Error creating organization: ${orgError.message}`);
        }

        console.log(`Organization created with id: ${orgData.id}`);
        const orgId = orgData.id;

        // 3. Create user record with admin role
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
                id: userId,
                org_id: orgId,
                role: 'admin'
            })
            .select()
            .single();

        if (userError) {
            throw new Error(`Error creating user record: ${userError.message}`);
        }

        console.log(`User record created with admin role`);

        // 4. Initialize org credits
        const { data: creditsData, error: creditsError } = await supabase
            .from('org_credits')
            .insert({
                org_id: orgId,
                credits: 100, // Starting credits
            })
            .select()
            .single();

        if (creditsError) {
            throw new Error(`Error initializing organization credits: ${creditsError.message}`);
        }

        console.log(`Organization credits initialized with 100 credits`);

        console.log('\n✅ Admin user creation successful!');
        console.log('================================================');
        console.log(`Admin Email: ${config.adminEmail}`);
        console.log(`Admin Password: ${config.adminPassword}`);
        console.log('================================================');
        console.log('Please save this information securely and change the password after first login.');

    } catch (error) {
        console.error('Error creating admin user:', error.message);
        process.exit(1);
    }
}

main(); 