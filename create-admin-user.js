// Script to create the admin user using the Supabase Auth API
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createAdmin() {
    // 1. Create the admin user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
        email: 'admin@example.com',
        password: 'admin123',
        email_confirm: true
    });
    if (error) return console.error(error);

    console.log('Admin user created:', data.user.id);

    // 2. Add to public.users table
    const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .single();
    if (orgError) return console.error(orgError);

    await supabase
        .from('users')
        .upsert({
            id: data.user.id,
            org_id: orgData.id,
            role: 'admin'
        });
    console.log('Admin user added to public.users table.');
}
createAdmin(); 