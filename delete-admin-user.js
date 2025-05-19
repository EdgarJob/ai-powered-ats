// Script to delete the admin user from Supabase Auth
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function deleteAdmin() {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) return console.error(error);

    const admin = data.users.find(u => u.email === 'admin@example.com');
    if (!admin) return console.log('No admin user found.');

    const { error: delError } = await supabase.auth.admin.deleteUser(admin.id);
    if (delError) return console.error(delError);

    console.log('Admin user deleted.');
}
deleteAdmin(); 