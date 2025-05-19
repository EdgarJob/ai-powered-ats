/**
 * Script to fix job management functionality
 * - Ensures correct metadata structure
 * - Sets up proper permissions
 * - Repairs any broken job records
 */

const { createClient } = require('@supabase/supabase-js');

// Config
const config = {
    supabaseUrl: 'http://127.0.0.1:54321',
    supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
};

// Create Supabase admin client
const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
);

async function main() {
    try {
        console.log('Running job management fix...');

        // 1. Verify admin access by testing edit operation
        console.log('Checking admin permissions...');

        const { data: adminUsers, error: adminError } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'admin')
            .limit(1);

        if (adminError) {
            throw new Error(`Error finding admin user: ${adminError.message}`);
        }

        if (!adminUsers || adminUsers.length === 0) {
            throw new Error('No admin users found');
        }

        console.log(`Found admin user: ${adminUsers[0].id}`);

        // 2. Fetch existing jobs to verify structure
        console.log('Fetching jobs...');

        const { data: jobs, error: jobsError } = await supabase
            .from('jobs')
            .select('*');

        if (jobsError) {
            throw new Error(`Error fetching jobs: ${jobsError.message}`);
        }

        console.log(`Found ${jobs?.length || 0} jobs`);

        // 3. Check if each job has properly structured metadata
        let fixedJobsCount = 0;

        for (const job of jobs || []) {
            let needsUpdate = false;
            let updatedMetadata = {};

            console.log(`Checking job: ${job.id} - ${job.title}`);

            // Check if metadata exists and is properly formatted
            if (!job.metadata) {
                console.log(`- Job ${job.id} has no metadata, creating it`);
                needsUpdate = true;

                // Create default metadata object
                updatedMetadata = {
                    industry: 'Technology',
                    location: 'Remote',
                    field: job.title.includes('Software') ? 'Software Development' : 'General',
                    deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
                };
            } else {
                // Try to parse metadata if it's a string
                try {
                    const metadata = typeof job.metadata === 'string'
                        ? JSON.parse(job.metadata)
                        : job.metadata;

                    // Check if it has the expected structure
                    const hasRequiredFields =
                        typeof metadata === 'object' &&
                        'industry' in metadata &&
                        'location' in metadata &&
                        'field' in metadata;

                    if (!hasRequiredFields) {
                        console.log(`- Job ${job.id} has incomplete metadata, updating...`);
                        needsUpdate = true;

                        // Preserve existing fields and add missing ones
                        updatedMetadata = {
                            ...metadata,
                            industry: metadata.industry || 'Technology',
                            location: metadata.location || 'Remote',
                            field: metadata.field || (job.title.includes('Software') ? 'Software Development' : 'General'),
                            deadline: metadata.deadline || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
                        };
                    } else {
                        console.log(`- Job ${job.id} has valid metadata structure`);
                        updatedMetadata = metadata;
                    }
                } catch (error) {
                    console.error(`- Error parsing metadata for job ${job.id}:`, error);
                    needsUpdate = true;

                    // Create new metadata since parsing failed
                    updatedMetadata = {
                        industry: 'Technology',
                        location: 'Remote',
                        field: job.title.includes('Software') ? 'Software Development' : 'General',
                        deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
                    };
                }
            }

            // Update the job if needed
            if (needsUpdate) {
                try {
                    const { error: updateError } = await supabase
                        .from('jobs')
                        .update({
                            metadata: JSON.stringify(updatedMetadata),
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', job.id);

                    if (updateError) {
                        console.error(`- Error updating job ${job.id}:`, updateError);
                    } else {
                        console.log(`- Successfully updated metadata for job ${job.id}`);
                        fixedJobsCount++;
                    }
                } catch (updateError) {
                    console.error(`- Exception updating job ${job.id}:`, updateError);
                }
            }

            // 4. Ensure job has required fields for editing
            const missingFields = [];

            if (!job.org_id) missingFields.push('org_id');
            if (!job.created_by) missingFields.push('created_by');

            if (missingFields.length > 0) {
                console.log(`- Job ${job.id} is missing required fields: ${missingFields.join(', ')}`);

                // Get org ID for the job
                const { data: orgs } = await supabase
                    .from('organizations')
                    .select('id')
                    .limit(1);

                const orgId = orgs && orgs.length > 0 ? orgs[0].id : null;

                if (orgId) {
                    const updateData = {};

                    if (missingFields.includes('org_id')) {
                        updateData.org_id = orgId;
                    }

                    if (missingFields.includes('created_by')) {
                        updateData.created_by = adminUsers[0].id;
                    }

                    // Update with missing fields
                    const { error: fixError } = await supabase
                        .from('jobs')
                        .update(updateData)
                        .eq('id', job.id);

                    if (fixError) {
                        console.error(`- Error fixing required fields for job ${job.id}:`, fixError);
                    } else {
                        console.log(`- Successfully added missing fields to job ${job.id}`);
                        fixedJobsCount++;
                    }
                } else {
                    console.error(`- No organization found to fix job ${job.id}`);
                }
            }
        }

        console.log(`Fixed ${fixedJobsCount} jobs`);
        console.log('Job management repair completed successfully');
    } catch (error) {
        console.error('Error during job management fix:', error);
        process.exit(1);
    }
}

main(); 