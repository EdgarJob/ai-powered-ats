// Script to check the schema of the candidates table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create admin client with service role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkCandidatesSchema() {
    console.log('Checking the schema of the candidates table...');

    try {
        // Method 1: Try to get one record to see the structure
        const { data: sampleCandidate, error: sampleError } = await supabaseAdmin
            .from('candidates')
            .select('*')
            .limit(1);

        if (sampleError) {
            console.error('Error getting sample candidate:', sampleError);
        } else if (sampleCandidate && sampleCandidate.length > 0) {
            console.log('Sample candidate record structure:');
            console.log(JSON.stringify(sampleCandidate[0], null, 2));
        } else {
            console.log('No candidates found in the table.');
        }

        // Method 2: Try to get the columns information using system views
        const { data: columnsInfo, error: columnsError } = await supabaseAdmin
            .rpc('get_table_columns', { table_name: 'candidates' });

        if (columnsError) {
            console.error('Error getting columns info:', columnsError);

            // Try direct SQL if RPC fails
            const { data: columns, error: sqlError } = await supabaseAdmin
                .from('information_schema.columns')
                .select('column_name, data_type, is_nullable')
                .eq('table_name', 'candidates')
                .order('ordinal_position');

            if (sqlError) {
                console.error('Error getting columns with SQL:', sqlError);
            } else {
                console.log('Columns from information_schema:');
                console.log(columns);
            }
        } else {
            console.log('Columns from RPC:');
            console.log(columnsInfo);
        }

    } catch (err) {
        console.error('Error checking schema:', err);
    }
}

// Run the function
checkCandidatesSchema().then(() => console.log('Schema check completed.')); 