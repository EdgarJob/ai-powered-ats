/**
 * Script to create sample published jobs
 */

const { createClient } = require('@supabase/supabase-js');

// Config - Using direct values for consistency
const config = {
    supabaseUrl: 'http://127.0.0.1:54321',
    supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
};

// Create Supabase admin client
const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
);

// Sample jobs data
const sampleJobs = [
    {
        title: 'Software Engineer',
        description: 'We are looking for a skilled software engineer to join our development team. You will be responsible for building and maintaining our web applications.',
        status: 'published',
        requirements: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        responsibilities: '- Develop and maintain web applications\n- Write clean, efficient code\n- Collaborate with cross-functional teams\n- Troubleshoot and debug applications',
        metadata: {
            industry: 'Technology',
            location: 'San Francisco, CA',
            field: 'Software Development',
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
        }
    },
    {
        title: 'Product Manager',
        description: 'We are seeking an experienced Product Manager to lead our product development initiatives. The ideal candidate will have a strong understanding of market trends and user needs.',
        status: 'published',
        requirements: ['Product Management', 'Agile', 'Market Research', 'User Experience'],
        responsibilities: '- Define product strategy and roadmap\n- Gather and prioritize requirements\n- Work with engineering teams to deliver features\n- Analyze market trends and competition',
        metadata: {
            industry: 'Technology',
            location: 'New York, NY',
            field: 'Product Management',
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0]
        }
    },
    {
        title: 'Data Scientist',
        description: 'Join our data science team to help extract insights from our vast datasets. You will apply statistical methods and machine learning algorithms to solve complex business problems.',
        status: 'published',
        requirements: ['Python', 'SQL', 'Machine Learning', 'Statistics'],
        responsibilities: '- Develop machine learning models\n- Analyze large datasets\n- Create data visualizations\n- Present findings to stakeholders',
        metadata: {
            industry: 'Data Analytics',
            location: 'Remote',
            field: 'Data Science',
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
        }
    },
    {
        title: 'UI/UX Designer',
        description: 'Design beautiful and intuitive interfaces for our web and mobile applications. You will work closely with product managers and developers to create seamless user experiences.',
        status: 'draft',
        requirements: ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping'],
        responsibilities: '- Create wireframes and mockups\n- Design user interfaces\n- Conduct user research\n- Create interactive prototypes\n- Work with developers on implementation',
        metadata: {
            industry: 'Design',
            location: 'Chicago, IL',
            field: 'UI/UX Design',
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0]
        }
    },
    {
        title: 'DevOps Engineer',
        description: 'Help us build and maintain our cloud infrastructure. You will work on automating deployment pipelines and ensuring high availability of our services.',
        status: 'draft',
        requirements: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
        responsibilities: '- Set up and maintain CI/CD pipelines\n- Manage cloud infrastructure\n- Implement monitoring and alerting\n- Automate deployment processes\n- Collaborate with developers',
        metadata: {
            industry: 'Technology',
            location: 'Remote',
            field: 'DevOps',
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
        }
    }
];

async function main() {
    try {
        console.log('Creating sample published jobs...');

        // First check if we already have jobs
        const { data: existingJobs, error: checkError } = await supabase
            .from('jobs')
            .select('id')
            .limit(1);

        if (checkError) {
            throw new Error(`Error checking existing jobs: ${checkError.message}`);
        }

        // Set up organization for the jobs
        let orgId;
        const { data: orgs, error: orgError } = await supabase
            .from('organizations')
            .select('id')
            .limit(1);

        if (orgError) {
            throw new Error(`Error finding organization: ${orgError.message}`);
        }

        if (orgs && orgs.length > 0) {
            orgId = orgs[0].id;
        } else {
            // Create a default organization
            const { data: newOrg, error: createOrgError } = await supabase
                .from('organizations')
                .insert({ name: 'Default Organization' })
                .select('id')
                .single();

            if (createOrgError) {
                throw new Error(`Error creating organization: ${createOrgError.message}`);
            }

            orgId = newOrg.id;
        }

        console.log(`Using organization ID: ${orgId}`);

        // Get admin user for created_by field
        let createdBy;
        const { data: adminUsers, error: adminError } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'admin')
            .limit(1);

        if (adminError) {
            throw new Error(`Error finding admin user: ${adminError.message}`);
        }

        if (adminUsers && adminUsers.length > 0) {
            createdBy = adminUsers[0].id;
        } else {
            createdBy = orgId; // Fallback to using org_id
        }

        console.log(`Using created_by: ${createdBy}`);

        if (existingJobs && existingJobs.length > 0) {
            console.log('Jobs already exist in the database. Updating status of some jobs to published...');

            // Update some jobs to published status
            const { data: updated, error: updateError } = await supabase
                .from('jobs')
                .update({ status: 'published' })
                .order('created_at', { ascending: false }) // Add explicit ordering
                .limit(3)
                .select();

            if (updateError) {
                throw new Error(`Error updating jobs: ${updateError.message}`);
            }

            console.log(`Updated ${updated?.length || 0} jobs to published status`);
        } else {
            // Insert sample jobs
            console.log('No existing jobs found. Inserting sample jobs...');

            // Process metadata to store as JSON and add required fields
            const jobsToInsert = sampleJobs.map(job => ({
                ...job,
                org_id: orgId,
                created_by: createdBy,
                metadata: JSON.stringify(job.metadata)
            }));

            const { data: insertedJobs, error: insertError } = await supabase
                .from('jobs')
                .insert(jobsToInsert)
                .select();

            if (insertError) {
                throw new Error(`Error inserting jobs: ${insertError.message}`);
            }

            console.log(`Successfully inserted ${insertedJobs?.length || 0} sample jobs`);
        }

        // Verify published jobs
        const { data: publishedJobs, error: verifyError } = await supabase
            .from('jobs')
            .select('id, title, status')
            .eq('status', 'published');

        if (verifyError) {
            throw new Error(`Error verifying published jobs: ${verifyError.message}`);
        }

        console.log(`Total published jobs: ${publishedJobs?.length || 0}`);
        if (publishedJobs?.length > 0) {
            publishedJobs.forEach(job => {
                console.log(`- ${job.id}: ${job.title} (${job.status})`);
            });
        }

        console.log('Done!');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main(); 