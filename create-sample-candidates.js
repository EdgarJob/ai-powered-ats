// Script to create sample candidate accounts directly
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Sample candidate data - 5 tech profiles and 5 non-tech profiles
const SAMPLE_CANDIDATES = [
    // Technical candidates
    {
        email: 'david.chen@example.com',
        password: 'password123',
        firstName: 'David',
        lastName: 'Chen',
        phone: '415-555-1234',
        gender: 'male',
        location: 'San Francisco, CA',
        dateOfBirth: '1992-05-15',
        bio: 'Full-stack developer with 7 years of experience. Passionate about clean code and microservices architecture.',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
        education: 'M.S. Computer Science, Stanford University',
        experience: '7 years in software development including 3 years at Google and 2 at a YC startup',
        isTechnical: true
    },
    {
        email: 'sophia.patel@example.com',
        password: 'password123',
        firstName: 'Sophia',
        lastName: 'Patel',
        phone: '206-555-7890',
        gender: 'female',
        location: 'Seattle, WA',
        dateOfBirth: '1990-08-22',
        bio: 'Data scientist specializing in machine learning and AI solutions for healthcare. Former research assistant at MIT.',
        skills: ['Python', 'TensorFlow', 'SQL', 'R', 'Data Visualization', 'Machine Learning'],
        education: 'Ph.D. in Data Science, MIT',
        experience: '5 years experience in ML and AI, previously at Amazon Web Services',
        isTechnical: true
    },
    {
        email: 'miguel.rodriguez@example.com',
        password: 'password123',
        firstName: 'Miguel',
        lastName: 'Rodriguez',
        phone: '512-555-4567',
        gender: 'male',
        location: 'Austin, TX',
        dateOfBirth: '1994-11-10',
        bio: 'Cybersecurity analyst with expertise in network security and penetration testing. CompTIA Security+ and CEH certified.',
        skills: ['Network Security', 'Penetration Testing', 'Kali Linux', 'Python', 'Wireshark', 'OWASP'],
        education: 'B.S. in Computer Science, UT Austin',
        experience: '4 years in cybersecurity, including roles at Dell and a security consulting firm',
        isTechnical: true
    },
    {
        email: 'alex.johnson@example.com',
        password: 'password123',
        firstName: 'Alex',
        lastName: 'Johnson',
        phone: '628-555-9012',
        gender: 'non-binary',
        location: 'Portland, OR',
        dateOfBirth: '1995-04-28',
        bio: 'DevOps engineer focused on CI/CD pipelines and infrastructure automation. Open source contributor.',
        skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'Jenkins', 'GitOps', 'Go'],
        education: 'B.S. in Information Systems, Oregon State University',
        experience: '3 years in DevOps, previously at Intel and a cloud services startup',
        isTechnical: true
    },
    {
        email: 'grace.kim@example.com',
        password: 'password123',
        firstName: 'Grace',
        lastName: 'Kim',
        phone: '213-555-6789',
        gender: 'female',
        location: 'Los Angeles, CA',
        dateOfBirth: '1989-02-14',
        bio: 'Mobile app developer specializing in iOS and Android development. Published 15+ apps with 1M+ downloads.',
        skills: ['Swift', 'Kotlin', 'Flutter', 'Firebase', 'UI/UX Design', 'Xcode', 'Android Studio'],
        education: 'M.S. in Software Engineering, UCLA',
        experience: '8 years in mobile development including 3 years at a leading mobile gaming company',
        isTechnical: true
    },

    // Non-technical candidates
    {
        email: 'james.wilson@example.com',
        password: 'password123',
        firstName: 'James',
        lastName: 'Wilson',
        phone: '312-555-2345',
        gender: 'male',
        location: 'Chicago, IL',
        dateOfBirth: '1987-09-03',
        bio: 'Marketing director with expertise in digital marketing strategies and brand management. Grew company revenue by 35% in 2 years.',
        skills: ['Digital Marketing', 'SEO/SEM', 'Content Strategy', 'Brand Management', 'Market Research'],
        education: 'MBA in Marketing, Northwestern University',
        experience: '10 years in marketing leadership roles at Fortune 500 companies',
        isTechnical: false
    },
    {
        email: 'emily.brown@example.com',
        password: 'password123',
        firstName: 'Emily',
        lastName: 'Brown',
        phone: '404-555-8901',
        gender: 'female',
        location: 'Atlanta, GA',
        dateOfBirth: '1991-07-17',
        bio: 'Human resources professional specializing in talent acquisition and employee development programs. SHRM certified.',
        skills: ['Talent Acquisition', 'Performance Management', 'Employee Relations', 'Compensation Planning', 'HR Analytics'],
        education: 'B.A. in Human Resource Management, Emory University',
        experience: '6 years in HR roles, most recently as Senior HR Manager at a healthcare company',
        isTechnical: false
    },
    {
        email: 'robert.taylor@example.com',
        password: 'password123',
        firstName: 'Robert',
        lastName: 'Taylor',
        phone: '917-555-3456',
        gender: 'male',
        location: 'New York, NY',
        dateOfBirth: '1985-12-09',
        bio: 'Financial analyst with a background in investment banking and equity research. CFA charterholder.',
        skills: ['Financial Modeling', 'Equity Valuation', 'Risk Assessment', 'Bloomberg Terminal', 'Excel', 'Financial Reporting'],
        education: 'B.S. in Finance, NYU Stern School of Business',
        experience: '9 years in finance, including 5 years at Goldman Sachs',
        isTechnical: false
    },
    {
        email: 'olivia.martinez@example.com',
        password: 'password123',
        firstName: 'Olivia',
        lastName: 'Martinez',
        phone: '305-555-6789',
        gender: 'female',
        location: 'Miami, FL',
        dateOfBirth: '1993-06-21',
        bio: 'Public relations specialist with experience in crisis management and media relations. Bilingual in English and Spanish.',
        skills: ['Media Relations', 'Crisis Management', 'Event Planning', 'Press Release Writing', 'Social Media Management'],
        education: 'B.A. in Communications, University of Miami',
        experience: '5 years in PR, previously handled communication for major entertainment brands',
        isTechnical: false
    },
    {
        email: 'daniel.jackson@example.com',
        password: 'password123',
        firstName: 'Daniel',
        lastName: 'Jackson',
        phone: '720-555-1234',
        gender: 'male',
        location: 'Denver, CO',
        dateOfBirth: '1990-10-12',
        bio: 'Sales manager with a proven track record of exceeding targets and building client relationships. Specializes in SaaS sales.',
        skills: ['B2B Sales', 'CRM Management', 'Sales Strategy', 'Negotiation', 'Customer Relationship Building'],
        education: 'B.S. in Business Administration, University of Colorado',
        experience: '7 years in sales, consistently achieving 120%+ of quota',
        isTechnical: false
    }
];

async function createSampleCandidates() {
    const createdCandidates = [];
    const errors = [];

    console.log('Starting to create sample candidates...');

    try {
        for (const candidate of SAMPLE_CANDIDATES) {
            try {
                console.log(`Creating candidate: ${candidate.firstName} ${candidate.lastName} (${candidate.email})`);

                // Create auth account
                const { data, error } = await supabase.auth.signUp({
                    email: candidate.email,
                    password: candidate.password,
                });

                if (error) {
                    console.error(`Error creating auth account for ${candidate.email}:`, error);
                    errors.push(`${candidate.email}: ${error.message}`);
                    continue;
                }

                if (!data.user) {
                    console.error(`User not created for ${candidate.email}`);
                    errors.push(`${candidate.email}: User creation failed`);
                    continue;
                }

                console.log(`Auth account created for ${candidate.email} with ID: ${data.user.id}`);

                // Create user record
                const { error: userError } = await supabaseAdmin
                    .from('users')
                    .insert([{
                        id: data.user.id,
                        email: candidate.email,
                        role: 'member',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }]);

                if (userError) {
                    console.error(`Error creating user record for ${candidate.email}:`, userError);
                    errors.push(`${candidate.email}: ${userError.message}`);
                    continue;
                }

                // Create candidate profile
                const candidateId = uuidv4();
                const { error: candidateError } = await supabaseAdmin
                    .from('candidates')
                    .insert([{
                        id: candidateId,
                        user_id: data.user.id,
                        email: candidate.email,
                        first_name: candidate.firstName,
                        last_name: candidate.lastName,
                        full_name: `${candidate.firstName} ${candidate.lastName}`,
                        phone: candidate.phone,
                        location: candidate.location,
                        gender: candidate.gender,
                        date_of_birth: candidate.dateOfBirth,
                        bio: candidate.bio,
                        skills: candidate.skills,
                        education: candidate.education,
                        experience: candidate.experience,
                        is_technical: candidate.isTechnical,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }]);

                if (candidateError) {
                    console.error(`Error creating candidate profile for ${candidate.email}:`, candidateError);
                    errors.push(`${candidate.email}: ${candidateError.message}`);
                    continue;
                }

                console.log(`Successfully created candidate: ${candidate.firstName} ${candidate.lastName}`);
                createdCandidates.push({
                    email: candidate.email,
                    password: candidate.password,
                    name: `${candidate.firstName} ${candidate.lastName}`,
                    role: 'member',
                    technical: candidate.isTechnical ? 'Technical' : 'Non-Technical'
                });

            } catch (err) {
                console.error(`Unexpected error for ${candidate.email}:`, err);
                errors.push(`${candidate.email}: Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
            }
        }

        console.log('\n=== RESULTS ===');

        if (errors.length === 0) {
            console.log(`✅ Successfully created all ${createdCandidates.length} sample candidates`);
        } else {
            console.log(`⚠️ Created ${createdCandidates.length} candidates with ${errors.length} errors`);
            console.log('Errors:');
            errors.forEach(error => console.log(`- ${error}`));
        }

        console.log('\n=== CANDIDATE CREDENTIALS ===');
        console.log('Use these credentials to log in as different users:');

        createdCandidates.forEach(user => {
            console.log(`- ${user.name} (${user.technical})`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Password: ${user.password}`);
            console.log('');
        });

    } catch (err) {
        console.error('Error creating sample candidates:', err);
        console.log(`Failed to create sample candidates: ${err instanceof Error ? err.message : String(err)}`);
    }
}

// Run the function
createSampleCandidates(); 