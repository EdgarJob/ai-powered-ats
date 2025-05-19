// Script to create or reset admin user with hardcoded credentials
const { createClient } = require('@supabase/supabase-js');
const { v4: uuid } = require('uuid');

// Database connection details
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create Supabase admin client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function resetAdminUser() {
    console.log('Starting admin user reset process...');

    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';

    try {
        // 1. First check if admin user exists in auth.users table
        console.log('Checking if admin user exists...');
        const { data: existingUser, error: userCheckError } = await supabaseAdmin.auth.admin.getUserByEmail(adminEmail);

        if (userCheckError) {
            console.error('Error checking for existing user:', userCheckError);
            return;
        }

        let userId;

        if (existingUser) {
            console.log('Admin user exists, updating password...');
            userId = existingUser.id;

            // Update user password
            const { error: passwordUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
                userId,
                { password: adminPassword }
            );

            if (passwordUpdateError) {
                console.error('Error updating admin password:', passwordUpdateError);
                return;
            }

            console.log('Admin password updated successfully!');
        } else {
            console.log('Admin user does not exist, creating new user...');

            // Create new user
            const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
                email: adminEmail,
                password: adminPassword,
                email_confirm: true,
            });

            if (createUserError) {
                console.error('Error creating admin user:', createUserError);
                return;
            }

            userId = newUser.id;
            console.log('Admin user created successfully!');
        }

        // 2. Check if user exists in public.users table
        console.log('Checking if admin user exists in public.users table...');
        const { data: existingPublicUser, error: publicUserCheckError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (publicUserCheckError && publicUserCheckError.code !== 'PGRST116') {
            console.error('Error checking for existing public user:', publicUserCheckError);
            // Continue anyway as this might just mean the user doesn't exist
        }

        if (!existingPublicUser) {
            console.log('Adding admin user to public.users table...');

            // Get default organization ID
            const { data: defaultOrg, error: orgError } = await supabaseAdmin
                .from('organizations')
                .select('id')
                .limit(1)
                .single();

            if (orgError) {
                console.error('Error getting default organization:', orgError);
                return;
            }

            // Add user to public.users table
            const { error: insertUserError } = await supabaseAdmin
                .from('users')
                .insert({
                    id: userId,
                    org_id: defaultOrg.id,
                    role: 'admin',
                });

            if (insertUserError) {
                console.error('Error adding admin to public.users table:', insertUserError);
                return;
            }

            console.log('Admin user added to public.users table successfully!');
        } else {
            console.log('Admin user already exists in public.users table.');

            // Update role to make sure it's admin
            const { error: updateRoleError } = await supabaseAdmin
                .from('users')
                .update({ role: 'admin' })
                .eq('id', userId);

            if (updateRoleError) {
                console.error('Error updating admin role:', updateRoleError);
                return;
            }

            console.log('Admin role confirmed/updated.');
        }

        console.log('\nADMIN USER SETUP COMPLETE');
        console.log('----------------------------------------');
        console.log('Email:    admin@example.com');
        console.log('Password: admin123');
        console.log('Role:     admin');
        console.log('----------------------------------------');
        console.log('You can now log in with these credentials.');

    } catch (error) {
        console.error('Unexpected error during admin user reset:', error);
    }
}

// Run the function
resetAdminUser(); 