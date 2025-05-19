// Script to fix the candidates table by adding profiles for existing auth users
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create admin client with service role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Sample candidate data - 5 tech profiles and 5 non-tech profiles
const SAMPLE_CANDIDATES = [
    // Technical candidates
    {
        email: 'david.chen@example.com',
        firstName: 'David',
        lastName: 'Chen',
        phone: '415-555-1234',
        resumeUrl: 'https://storage.example.com/resumes/david-chen.pdf',
        jobId: 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
        isTechnical: true
    },
    {
        email: 'sophia.patel@example.com',
        firstName: 'Sophia',
        lastName: 'Patel',
        phone: '206-555-7890',
        resumeUrl: 'https://storage.example.com/resumes/sophia-patel.pdf',
        jobId: 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
        isTechnical: true
    },
    {
        email: 'miguel.rodriguez@example.com',
        firstName: 'Miguel',
        lastName: 'Rodriguez',
        phone: '512-555-4567',
        resumeUrl: 'https://storage.example.com/resumes/miguel-rodriguez.pdf',
        jobId: 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
        isTechnical: true
    },
    {
        email: 'alex.johnson@example.com',
        firstName: 'Alex',
        lastName: 'Johnson',
        phone: '628-555-9012',
        resumeUrl: 'https://storage.example.com/resumes/alex-johnson.pdf',
        jobId: 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
        isTechnical: true
    },
    {
        email: 'grace.kim@example.com',
        firstName: 'Grace',
        lastName: 'Kim',
        phone: '213-555-6789',
        resumeUrl: 'https://storage.example.com/resumes/grace-kim.pdf',
        jobId: 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
        isTechnical: true
    },

    // Non-technical candidates
    {
        email: 'james.wilson@example.com',
        firstName: 'James',
        lastName: 'Wilson',
        phone: '312-555-2345',
        resumeUrl: 'https://storage.example.com/resumes/james-wilson.pdf',
        jobId: 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
        isTechnical: false
    },
    {
        email: 'emily.brown@example.com',
        firstName: 'Emily',
        lastName: 'Brown',
        phone: '404-555-8901',
        resumeUrl: 'https://storage.example.com/resumes/emily-brown.pdf',
        jobId: 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
        isTechnical: false
    },
    {
        email: 'robert.taylor@example.com',
        firstName: 'Robert',
        lastName: 'Taylor',
        phone: '917-555-3456',
        resumeUrl: 'https://storage.example.com/resumes/robert-taylor.pdf',
        jobId: 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
        isTechnical: false
    },
    {
        email: 'olivia.martinez@example.com',
        firstName: 'Olivia',
        lastName: 'Martinez',
        phone: '305-555-6789',
        resumeUrl: 'https://storage.example.com/resumes/olivia-martinez.pdf',
        jobId: 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
        isTechnical: false
    },
    {
        email: 'daniel.jackson@example.com',
        firstName: 'Daniel',
        lastName: 'Jackson',
        phone: '720-555-1234',
        resumeUrl: 'https://storage.example.com/resumes/daniel-jackson.pdf',
        jobId: 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
        isTechnical: false
    }
];

async function fixCandidates() {
    console.log('Starting to add sample candidates...');
    const createdCandidates = [];
    const errors = [];

    try {
        // Create each candidate
        for (const candidate of SAMPLE_CANDIDATES) {
            try {
                console.log(`Creating candidate ${candidate.firstName} ${candidate.lastName} (${candidate.email})...`);

                // First check if candidate already exists
                const { data: existingCandidate, error: checkError } = await supabaseAdmin
                    .from('candidates')
                    .select('id')
                    .eq('email', candidate.email)
                    .limit(1);

                if (checkError) {
                    console.error(`Error checking for existing candidate ${candidate.email}:`, checkError);
                    errors.push(`${candidate.email}: Error checking: ${checkError.message}`);
                    continue;
                }

                if (existingCandidate && existingCandidate.length > 0) {
                    console.log(`Candidate profile already exists for ${candidate.email}`);

                    // Add to created candidates list anyway so credentials are shown
                    createdCandidates.push({
                        email: candidate.email,
                        password: 'password123', // Standard password for all
                        name: `${candidate.firstName} ${candidate.lastName}`,
                        technical: candidate.isTechnical ? 'Technical' : 'Non-Technical'
                    });

                    continue;
                }

                // Create candidate - using the correct schema we found
                const candidateId = uuidv4();
                const { error: candidateError } = await supabaseAdmin
                    .from('candidates')
                    .insert([{
                        id: candidateId,
                        job_id: candidate.jobId,
                        full_name: `${candidate.firstName} ${candidate.lastName}`,
                        email: candidate.email,
                        phone: candidate.phone,
                        resume_url: candidate.resumeUrl,
                        status: 'pending',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }]);

                if (candidateError) {
                    console.error(`Error creating candidate profile for ${candidate.email}:`, candidateError);
                    errors.push(`${candidate.email}: ${candidateError.message}`);
                    continue;
                }

                // Now create the auth account if it doesn't exist
                const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                    email: candidate.email,
                    password: 'password123',
                    email_confirm: true
                });

                if (authError) {
                    console.log(`Note: Auth user may already exist for ${candidate.email}: ${authError.message}`);
                } else {
                    console.log(`Created auth user for ${candidate.email}`);
                }

                console.log(`Successfully created candidate profile for ${candidate.firstName} ${candidate.lastName}`);
                createdCandidates.push({
                    email: candidate.email,
                    password: 'password123', // Standard password for all
                    name: `${candidate.firstName} ${candidate.lastName}`,
                    technical: candidate.isTechnical ? 'Technical' : 'Non-Technical'
                });

            } catch (err) {
                console.error(`Unexpected error for ${candidate.email}:`, err);
                errors.push(`${candidate.email}: Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
            }
        }

        // Output results
        console.log('\n=== RESULTS ===');

        if (errors.length === 0) {
            console.log(`✅ Successfully created all ${createdCandidates.length} candidate profiles`);
        } else {
            console.log(`⚠️ Created ${createdCandidates.length} candidate profiles with ${errors.length} errors`);
            console.log('Errors:');
            errors.forEach(error => console.log(`- ${error}`));
        }

        console.log('\n=== CANDIDATE CREDENTIALS ===');
        console.log('Use these credentials to log in:');

        createdCandidates.forEach(user => {
            console.log(`- ${user.name} (${user.technical})`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Password: ${user.password}`);
            console.log('');
        });

    } catch (err) {
        console.error('Error fixing candidates:', err);
    }
}

// Run the function
fixCandidates().then(() => console.log('Script completed.')); 