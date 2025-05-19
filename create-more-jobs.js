/**
 * Script to create additional job listings
 */

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

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

// More diverse job listings
const additionalJobs = [
    {
        title: 'Digital Marketing Specialist',
        description: 'Join our marketing team to develop and implement digital marketing strategies. You will work on campaigns across multiple channels to drive traffic and increase conversions.',
        status: 'published',
        requirements: ['Digital Marketing', 'SEO', 'Social Media Marketing', 'Content Creation'],
        responsibilities: '- Develop and execute digital marketing campaigns\n- Manage social media accounts\n- Optimize website SEO\n- Create and distribute marketing content\n- Analyze campaign metrics',
        metadata: {
            industry: 'Marketing',
            location: 'Chicago, IL',
            field: 'Digital Marketing',
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
        }
    },
    {
        title: 'Financial Analyst',
        description: 'We are looking for a skilled Financial Analyst to support our finance team. You will analyze financial data, prepare reports, and provide insights to support business decisions.',
        status: 'published',
        requirements: ['Financial Analysis', 'Excel', 'Forecasting', 'Budgeting'],
        responsibilities: '- Develop financial models\n- Prepare monthly financial reports\n- Analyze business performance\n- Support budgeting process\n- Identify trends and insights',
        metadata: {
            industry: 'Finance',
            location: 'New York, NY',
            field: 'Finance',
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0]
        }
    },
    {
        title: 'HR Manager',
        description: 'Lead our HR team and oversee all HR operations. You will be responsible for recruitment, employee relations, performance management, and policy development.',
        status: 'published',
        requirements: ['HR Management', 'Recruitment', 'Employee Relations', 'Performance Management'],
        responsibilities: '- Oversee recruitment and hiring\n- Manage employee relations\n- Develop HR policies and procedures\n- Administer benefits and compensation\n- Support organizational development',
        metadata: {
            industry: 'Human Resources',
            location: 'Austin, TX',
            field: 'HR Management',
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
        }
    },
    {
        title: 'Customer Support Specialist',
        description: 'Join our customer support team to help our customers have a great experience with our products. You will respond to inquiries, resolve issues, and ensure customer satisfaction.',
        status: 'draft',
        requirements: ['Customer Service', 'Communication Skills', 'Problem Solving', 'Technical Troubleshooting'],
        responsibilities: '- Respond to customer inquiries\n- Resolve customer issues\n- Document customer interactions\n- Identify common problems\n- Suggest process improvements',
        metadata: {
            industry: 'Customer Service',
            location: 'Remote',
            field: 'Customer Support',
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
        }
    },
    {
        title: 'Sales Representative',
        description: 'Drive sales growth by identifying and pursuing new business opportunities. You will build relationships with potential clients and convert leads into sales.',
        status: 'draft',
        requirements: ['Sales Experience', 'Negotiation', 'CRM Software', 'Communication Skills'],
        responsibilities: '- Identify and pursue sales leads\n- Conduct product demonstrations\n- Negotiate contracts\n- Meet sales targets\n- Maintain client relationships',
        metadata: {
            industry: 'Sales',
            location: 'Miami, FL',
            field: 'Sales',
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0]
        }
    }
];

async function main() {
    try {
        console.log('Creating additional job listings...');

        // Get organization ID
        const { data: orgs, error: orgError } = await supabase
            .from('organizations')
            .select('id')
            .limit(1);

        if (orgError) {
            throw new Error(`Error finding organization: ${orgError.message}`);
        }

        if (!orgs || orgs.length === 0) {
            throw new Error('No organization found');
        }

        const orgId = orgs[0].id;
        console.log(`Using organization ID: ${orgId}`);

        // Get admin user ID
        const { data: adminUsers, error: adminError } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'admin')
            .limit(1);

        if (adminError) {
            throw new Error(`Error finding admin user: ${adminError.message}`);
        }

        if (!adminUsers || adminUsers.length === 0) {
            throw new Error('No admin user found');
        }

        const createdBy = adminUsers[0].id;
        console.log(`Using created by: ${createdBy}`);

        // Generate unique IDs for each job to avoid collisions
        const jobsToInsert = additionalJobs.map(job => ({
            id: uuidv4(), // Generate a UUID for each job
            ...job,
            org_id: orgId,
            created_by: createdBy,
            metadata: JSON.stringify(job.metadata)
        }));

        // Insert jobs
        const { data: insertedJobs, error: insertError } = await supabase
            .from('jobs')
            .insert(jobsToInsert)
            .select();

        if (insertError) {
            throw new Error(`Error inserting jobs: ${insertError.message}`);
        }

        console.log(`Successfully inserted ${insertedJobs?.length || 0} new jobs`);

        // Verify total jobs
        const { data: allJobs, error: countError } = await supabase
            .from('jobs')
            .select('id, title, status');

        if (countError) {
            throw new Error(`Error counting jobs: ${countError.message}`);
        }

        console.log(`Total jobs in database: ${allJobs?.length || 0}`);
        console.log('Done!');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main(); 