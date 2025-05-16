// Simple script to check jobs in the database
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://pdfgnqutqreluoetvfdh.supabase.co',
    process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZmducXV0cXJlbHVvZXR2ZmRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMzY1MDQ5MCwiZXhwIjoyMDI5MjI2NDkwfQ.s3HPUX4NN_mP0ZsfQz5rU7j1TmZ-Mzs72TH_tShW1GI'
);

const checkJobs = async () => {
    try {
        // Get all jobs
        console.log('Fetching all jobs...');
        const { data: allJobs, error: jobsError } = await supabase
            .from('jobs')
            .select('id, title, status');

        if (jobsError) {
            console.error('Error fetching jobs:', jobsError);
            return;
        }

        console.log(`Found ${allJobs?.length || 0} total jobs`);

        // Group jobs by status
        const jobsByStatus = {};
        allJobs?.forEach(job => {
            const status = job.status || 'undefined';
            if (!jobsByStatus[status]) {
                jobsByStatus[status] = [];
            }
            jobsByStatus[status].push(job);
        });

        // Print job counts by status
        console.log('\nJobs by status:');
        Object.keys(jobsByStatus).forEach(status => {
            console.log(`- ${status}: ${jobsByStatus[status].length} jobs`);
        });

        // Print details of each job
        console.log('\nJob details:');
        allJobs?.forEach((job, index) => {
            console.log(`${index + 1}. ID: ${job.id}, Title: ${job.title}, Status: ${job.status || 'undefined'}`);
        });

        // Update a job to published status if needed
        if (allJobs?.length > 0 && !jobsByStatus['published']?.length) {
            const firstJob = allJobs[0];
            console.log(`\nNo published jobs found. Updating job '${firstJob.title}' (ID: ${firstJob.id}) to published status...`);

            const { error: updateError } = await supabase
                .from('jobs')
                .update({ status: 'published' })
                .eq('id', firstJob.id);

            if (updateError) {
                console.error('Error updating job status:', updateError);
            } else {
                console.log('Job updated successfully to published status.');
            }
        }
    } catch (error) {
        console.error('Error checking jobs:', error);
    }
};

// Execute the check
checkJobs(); 