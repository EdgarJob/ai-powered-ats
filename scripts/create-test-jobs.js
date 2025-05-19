/**
 * Script to create test jobs and verify database connection
 */

require('dotenv').config({ path: './.env' });
const { createClient } = require('@supabase/supabase-js');

// Config using environment variables with direct fallbacks
const config = {
    supabaseUrl: process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
    supabaseServiceKey: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
};

console.log('Using config:', config);

// Create Supabase admin client
const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
);

// Sample test jobs
const testJobs = [
    {
        title: 'Frontend Developer (Test)',
        description: 'This is a test job posting for a Frontend Developer role. We are looking for someone skilled in React, TypeScript, and modern CSS.',
        status: 'published',
        requirements: ['React', 'TypeScript', 'CSS', 'JavaScript'],
        responsibilities: '- Build responsive web applications\n- Write clean, maintainable code\n- Collaborate with designers and backend developers',
        metadata: {
            industry: 'Technology',
            location: 'Remote',
            field: 'Web Development',
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
        }
    },
    {
        title: 'UX Designer (Test)',
        description: 'This is a test job posting for a UX Designer position. Join our team to create beautiful and intuitive user experiences.',
        status: 'published',
        requirements: ['Figma', 'User Research', 'Prototyping', 'UI Design'],
        responsibilities: '- Create wireframes and prototypes\n- Conduct user research\n- Work with development team to implement designs',
        metadata: {
            industry: 'Design',
            location: 'San Francisco, CA',
            field: 'User Experience',
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0]
        }
    }
];

async function main() {
    try {
        console.log('\n🔍 Supabase Connection Test');
        console.log('==============================================');
        console.log('Supabase URL:', config.supabaseUrl);
        console.log('Service Key (last 4 chars):', config.supabaseServiceKey.slice(-4));
        console.log('Attempting connection...');

        // Check if jobs table exists
        console.log('\n🔍 Checking Jobs Table');
        console.log('==============================================');

        const { data: tableInfo, error: tableError } = await supabase
            .from('jobs')
            .select('id')
            .limit(1);

        if (tableError) {
            console.error('❌ Jobs table error:', tableError.message);

            console.log('\n❌ Unable to access jobs table. Check if table exists and Supabase is running.');
            process.exit(1);
        }

        console.log('✅ Jobs table accessible');
        console.log('✅ Connection successful!');

        // Get current jobs
        const { data: currentJobs, error: jobsError } = await supabase
            .from('jobs')
            .select('id, title, status')
            .order('created_at', { ascending: false });

        if (jobsError) {
            console.error('❌ Error fetching jobs:', jobsError.message);
        } else {
            console.log(`\n📋 Current Jobs: ${currentJobs?.length || 0}`);
            console.log('==============================================');
            if (currentJobs && currentJobs.length > 0) {
                currentJobs.forEach(job => {
                    console.log(`- ${job.id}: ${job.title} (${job.status})`);
                });
            } else {
                console.log('No jobs found');
            }
        }

        // Check for published jobs
        const { data: publishedJobs, error: publishedError } = await supabase
            .from('jobs')
            .select('id, title')
            .eq('status', 'published');

        if (publishedError) {
            console.error('❌ Error checking published jobs:', publishedError.message);
        } else {
            console.log(`\n🌐 Published Jobs: ${publishedJobs?.length || 0}`);

            if (!publishedJobs || publishedJobs.length === 0) {
                console.log('⚠️ No published jobs found. Creating test jobs...');

                // Process metadata to store as JSON
                const jobsToInsert = testJobs.map(job => ({
                    ...job,
                    metadata: job.metadata // Supabase will handle JSON conversion
                }));

                const { data: insertedJobs, error: insertError } = await supabase
                    .from('jobs')
                    .insert(jobsToInsert)
                    .select();

                if (insertError) {
                    console.error('❌ Error inserting test jobs:', insertError.message);
                } else {
                    console.log(`✅ Successfully inserted ${insertedJobs?.length || 0} test jobs`);
                    if (insertedJobs && insertedJobs.length > 0) {
                        insertedJobs.forEach(job => {
                            console.log(`- ${job.id}: ${job.title} (${job.status})`);
                        });
                    }
                }
            } else {
                console.log('==============================================');
                publishedJobs.forEach(job => {
                    console.log(`- ${job.id}: ${job.title}`);
                });
            }
        }

        // Update status of existing jobs to published if needed
        if (currentJobs?.length > 0 && (!publishedJobs || publishedJobs.length === 0)) {
            console.log('\n🔄 Updating existing jobs to published status...');

            const jobsToUpdate = currentJobs.slice(0, 2).map(job => job.id);

            const { data: updatedJobs, error: updateError } = await supabase
                .from('jobs')
                .update({ status: 'published' })
                .in('id', jobsToUpdate)
                .select();

            if (updateError) {
                console.error('❌ Error updating jobs:', updateError.message);
            } else {
                console.log(`✅ Updated ${updatedJobs?.length || 0} jobs to published status`);
                if (updatedJobs && updatedJobs.length > 0) {
                    updatedJobs.forEach(job => {
                        console.log(`- ${job.id}: ${job.title} (${job.status})`);
                    });
                }
            }
        }

        console.log('\n✨ Done!');
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        process.exit(1);
    }
}

main(); 