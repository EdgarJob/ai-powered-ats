/**
 * Script to verify job data completeness
 */

const { createClient } = require('@supabase/supabase-js');

// Config
const config = {
    supabaseUrl: 'http://127.0.0.1:54321',
    supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
};

// Create Supabase client
const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
);

async function main() {
    try {
        console.log('Checking job data completeness...\n');

        // Fetch all jobs
        const { data: jobs, error } = await supabase
            .from('jobs')
            .select('*');

        if (error) {
            throw new Error(`Error fetching jobs: ${error.message}`);
        }

        console.log(`Found ${jobs?.length || 0} total jobs\n`);

        // Summary statistics
        let complete = 0;
        let missingResponsibilities = 0;
        let missingMetadata = 0;
        let missingRequirements = 0;

        // Check each job for completeness
        console.log('Job Data Summary:');
        console.log('----------------\n');

        for (const job of jobs || []) {
            // Parse metadata
            let metadata;
            try {
                metadata = typeof job.metadata === 'string'
                    ? JSON.parse(job.metadata)
                    : job.metadata;
            } catch (e) {
                metadata = null;
            }

            // Check for required fields
            const hasResponsibilities = !!job.responsibilities && job.responsibilities.trim() !== '';
            const hasMetadata = metadata && Object.keys(metadata).length > 0;
            const hasRequirements = Array.isArray(job.requirements) && job.requirements.length > 0;

            // Calculate completeness percentage
            let completeness = 0;
            let completenessItems = 0;

            // Basic fields checks (always present)
            completeness += job.title ? 10 : 0;
            completeness += job.description ? 10 : 0;
            completeness += job.status ? 10 : 0;
            completenessItems += 3;

            // Optional fields
            if (hasResponsibilities) completeness += 10;
            if (hasMetadata) completeness += 10;
            if (hasRequirements) completeness += 10;
            completenessItems += 3;

            // Calculate percentage
            const completenessPercentage = Math.round((completeness / (completenessItems * 10)) * 100);

            // Log job details
            console.log(`${job.title}:`,
                `\n  ID: ${job.id}`,
                `\n  Status: ${job.status || 'unknown'}`,
                `\n  Description: ${job.description ? 'Present' : 'Missing'}`,
                `\n  Responsibilities: ${hasResponsibilities ? 'Present' : 'Missing'}`,
                `\n  Requirements: ${hasRequirements ? 'Present' : 'Missing'}`,
                `\n  Metadata: ${hasMetadata ? 'Present' : 'Missing'}`,
                `\n  Completeness: ${completenessPercentage}%\n`
            );

            // Update counters
            if (completenessPercentage === 100) {
                complete++;
            }
            if (!hasResponsibilities) missingResponsibilities++;
            if (!hasMetadata) missingMetadata++;
            if (!hasRequirements) missingRequirements++;
        }

        // Print summary
        console.log('\nSummary:');
        console.log('-------');
        console.log(`Total jobs: ${jobs?.length || 0}`);
        console.log(`Complete jobs: ${complete} (${Math.round((complete / (jobs?.length || 1)) * 100)}%)`);
        console.log(`Jobs missing responsibilities: ${missingResponsibilities}`);
        console.log(`Jobs missing metadata: ${missingMetadata}`);
        console.log(`Jobs missing requirements: ${missingRequirements}`);

        console.log('\nJob data check completed!');

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main(); 