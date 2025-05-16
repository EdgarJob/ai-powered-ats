import { supabaseAdmin } from './supabase';

/**
 * Utility to inspect the database structure and permissions
 */
export async function inspectJobsTable() {
    try {
        console.log('Inspecting jobs table structure...');
        
        // Query the full structure of the jobs table
        const { data: tableInfo, error: tableError } = await supabaseAdmin.rpc(
            'execute_sql',
            {
                sql: `
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'jobs'
                ORDER BY ordinal_position
                `
            }
        );
        
        if (tableError) {
            console.error('Failed to get table structure:', tableError);
            // Try alternate approach
            try {
                const { data, error } = await supabaseAdmin
                    .from('jobs')
                    .select('*')
                    .limit(1);
                
                if (error) {
                    console.error('Failed to query jobs table:', error);
                } else {
                    if (data && data.length > 0) {
                        console.log('Job table structure inferred from data:');
                        const jobRecord = data[0];
                        Object.keys(jobRecord).forEach(key => {
                            console.log(`- ${key}: ${typeof jobRecord[key]} ${jobRecord[key] === null ? '(null)' : ''}`);
                        });
                    } else {
                        console.log('No jobs found to inspect structure');
                    }
                }
            } catch (err) {
                console.error('Error querying jobs:', err);
            }
        } else {
            console.log('Jobs table structure:', tableInfo);
        }
        
        // Try to test an update to the responsibilities field
        console.log('Testing responsibilities column update...');
        try {
            // Create a test record
            const testId = 'test-' + Date.now();
            const { data: insertData, error: insertError } = await supabaseAdmin
                .from('jobs')
                .insert([
                    {
                        id: testId,
                        title: 'Test Job',
                        description: 'Test Description',
                        requirements: ['Test Requirement'],
                        status: 'draft',
                        org_id: 'd9d53a82-7ae9-4c0f-8f49-6f4a74d6ca97', // Default org ID
                        created_by: 'e9d53a82-7ae9-4c0f-8f49-6f4a74d6ca98', // Default user ID
                    }
                ])
                .select();
            
            if (insertError) {
                console.error('Failed to insert test job:', insertError);
            } else {
                console.log('Test job inserted:', insertData);
                
                // Try updating just the responsibilities
                const { data: updateData, error: updateError } = await supabaseAdmin
                    .from('jobs')
                    .update({ responsibilities: 'Test Responsibilities' })
                    .eq('id', testId)
                    .select();
                
                if (updateError) {
                    console.error('Failed to update responsibilities:', updateError);
                } else {
                    console.log('Responsibilities updated:', updateData);
                }
                
                // Try updating with direct SQL
                try {
                    await supabaseAdmin.rpc('execute_sql', {
                        sql: `UPDATE jobs SET responsibilities = 'SQL Test Responsibilities' WHERE id = '${testId}'`
                    });
                    console.log('Updated responsibilities using SQL');
                    
                    // Verify the update
                    const { data: verifyData } = await supabaseAdmin
                        .from('jobs')
                        .select('*')
                        .eq('id', testId)
                        .single();
                    
                    console.log('Verification after SQL update:', verifyData);
                } catch (sqlError) {
                    console.error('SQL update failed:', sqlError);
                }
                
                // Clean up the test record
                const { error: deleteError } = await supabaseAdmin
                    .from('jobs')
                    .delete()
                    .eq('id', testId);
                
                if (deleteError) {
                    console.error('Failed to delete test job:', deleteError);
                } else {
                    console.log('Test job deleted successfully');
                }
            }
        } catch (testError) {
            console.error('Test job error:', testError);
        }
        
        return 'Inspection complete';
    } catch (error) {
        console.error('Error during inspection:', error);
        return 'Inspection failed: ' + error;
    }
} 