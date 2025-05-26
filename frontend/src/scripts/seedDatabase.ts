import { createCandidate, getCandidates } from '../lib/candidate-service';
import { createJob, getJobs } from '../lib/job-service';
import { createJobApplication } from '../lib/candidate-service';
import { checkFirebaseConnection } from '../lib/firebase';

// Sample candidate data
const sampleCandidates = [
    {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0123',
        location: 'San Francisco, CA',
        currentPosition: 'Senior Software Engineer',
        yearsOfExperience: 5,
        education: [
            {
                degree: 'Bachelor of Science in Computer Science',
                institution: 'Stanford University',
                year: 2019
            }
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'MongoDB', 'TypeScript'],
        metadata: {
            bio: 'Passionate full-stack developer with expertise in modern web technologies and cloud infrastructure.',
            linkedIn: 'https://linkedin.com/in/sarahjohnson',
            github: 'https://github.com/sarahjohnson'
        }
    },
    {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@email.com',
        phone: '+1-555-0124',
        location: 'New York, NY',
        currentPosition: 'Data Scientist',
        yearsOfExperience: 3,
        education: [
            {
                degree: 'Master of Science in Data Science',
                institution: 'MIT',
                year: 2021
            },
            {
                degree: 'Bachelor of Science in Mathematics',
                institution: 'UC Berkeley',
                year: 2019
            }
        ],
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'R', 'Pandas', 'Scikit-learn', 'Tableau'],
        metadata: {
            bio: 'Data scientist specializing in machine learning and predictive analytics with a strong mathematical background.',
            linkedIn: 'https://linkedin.com/in/michaelchen',
            github: 'https://github.com/michaelchen'
        }
    },
    {
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily.rodriguez@email.com',
        phone: '+1-555-0125',
        location: 'Austin, TX',
        currentPosition: 'UX Designer',
        yearsOfExperience: 4,
        education: [
            {
                degree: 'Bachelor of Fine Arts in Graphic Design',
                institution: 'Art Institute of Chicago',
                year: 2020
            }
        ],
        skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Wireframing', 'HTML', 'CSS', 'JavaScript'],
        metadata: {
            bio: 'Creative UX designer with a passion for creating intuitive and accessible user experiences.',
            portfolio: 'https://emilyrodriguez.design',
            linkedIn: 'https://linkedin.com/in/emilyrodriguez'
        }
    },
    {
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.kim@email.com',
        phone: '+1-555-0126',
        location: 'Seattle, WA',
        currentPosition: 'DevOps Engineer',
        yearsOfExperience: 6,
        education: [
            {
                degree: 'Bachelor of Science in Information Technology',
                institution: 'University of Washington',
                year: 2018
            }
        ],
        skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Jenkins', 'Python', 'Bash', 'Monitoring', 'CI/CD'],
        metadata: {
            bio: 'DevOps engineer focused on automation, scalability, and reliability of cloud infrastructure.',
            linkedIn: 'https://linkedin.com/in/davidkim',
            github: 'https://github.com/davidkim'
        }
    },
    {
        firstName: 'Jessica',
        lastName: 'Thompson',
        email: 'jessica.thompson@email.com',
        phone: '+1-555-0127',
        location: 'Boston, MA',
        currentPosition: 'Product Manager',
        yearsOfExperience: 7,
        education: [
            {
                degree: 'MBA',
                institution: 'Harvard Business School',
                year: 2020
            },
            {
                degree: 'Bachelor of Science in Engineering',
                institution: 'MIT',
                year: 2017
            }
        ],
        skills: ['Product Strategy', 'Agile', 'Scrum', 'Data Analysis', 'User Research', 'Roadmapping', 'Stakeholder Management'],
        metadata: {
            bio: 'Strategic product manager with engineering background and proven track record of launching successful products.',
            linkedIn: 'https://linkedin.com/in/jessicathompson'
        }
    },
    {
        firstName: 'Alex',
        lastName: 'Patel',
        email: 'alex.patel@email.com',
        phone: '+1-555-0128',
        location: 'Los Angeles, CA',
        currentPosition: 'Frontend Developer',
        yearsOfExperience: 2,
        education: [
            {
                degree: 'Bachelor of Science in Computer Science',
                institution: 'UCLA',
                year: 2022
            }
        ],
        skills: ['React', 'Vue.js', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Webpack', 'Git'],
        metadata: {
            bio: 'Junior frontend developer passionate about creating beautiful and responsive web applications.',
            linkedIn: 'https://linkedin.com/in/alexpatel',
            github: 'https://github.com/alexpatel'
        }
    }
];

// Sample job data
const sampleJobs = [
    {
        title: 'Senior Full Stack Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        description: 'We are looking for an experienced full stack developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.',
        employmentType: 'Full-time' as const,
        requirements: [
            '5+ years of experience in web development',
            'Proficiency in JavaScript, React, and Node.js',
            'Experience with cloud platforms (AWS, Azure, or GCP)',
            'Strong understanding of database design and SQL',
            'Experience with version control systems (Git)'
        ],
        responsibilities: [
            'Develop and maintain web applications',
            'Collaborate with cross-functional teams',
            'Write clean, maintainable code',
            'Participate in code reviews',
            'Troubleshoot and debug applications'
        ],
        salary: {
            min: 120000,
            max: 160000,
            currency: 'USD'
        },
        status: 'published' as const
    },
    {
        title: 'Data Scientist',
        company: 'DataTech Solutions',
        location: 'New York, NY',
        description: 'Join our data science team to build machine learning models and extract insights from large datasets to drive business decisions.',
        employmentType: 'Full-time' as const,
        requirements: [
            'Master\'s degree in Data Science, Statistics, or related field',
            'Strong programming skills in Python and R',
            'Experience with machine learning frameworks (TensorFlow, PyTorch)',
            'Knowledge of statistical analysis and data visualization',
            'Experience with SQL and big data technologies'
        ],
        responsibilities: [
            'Develop and deploy machine learning models',
            'Analyze large datasets to identify trends and patterns',
            'Create data visualizations and reports',
            'Collaborate with business stakeholders',
            'Present findings to technical and non-technical audiences'
        ],
        salary: {
            min: 110000,
            max: 140000,
            currency: 'USD'
        },
        status: 'published' as const
    },
    {
        title: 'UX/UI Designer',
        company: 'Design Studio Pro',
        location: 'Austin, TX',
        description: 'We are seeking a creative UX/UI designer to create intuitive and engaging user experiences for our digital products.',
        employmentType: 'Full-time' as const,
        requirements: [
            'Bachelor\'s degree in Design, HCI, or related field',
            'Proficiency in design tools (Figma, Sketch, Adobe Creative Suite)',
            'Strong portfolio demonstrating UX/UI design skills',
            'Understanding of user-centered design principles',
            'Experience with prototyping and user testing'
        ],
        responsibilities: [
            'Create wireframes, prototypes, and high-fidelity designs',
            'Conduct user research and usability testing',
            'Collaborate with developers and product managers',
            'Maintain design systems and style guides',
            'Present design concepts to stakeholders'
        ],
        salary: {
            min: 80000,
            max: 110000,
            currency: 'USD'
        },
        status: 'published' as const
    },
    {
        title: 'DevOps Engineer',
        company: 'CloudTech Systems',
        location: 'Seattle, WA',
        description: 'Looking for a DevOps engineer to help build and maintain our cloud infrastructure and deployment pipelines.',
        employmentType: 'Full-time' as const,
        requirements: [
            'Bachelor\'s degree in Computer Science or related field',
            'Experience with containerization (Docker, Kubernetes)',
            'Knowledge of cloud platforms (AWS, Azure, GCP)',
            'Proficiency in scripting languages (Python, Bash)',
            'Experience with CI/CD tools and practices'
        ],
        responsibilities: [
            'Design and maintain cloud infrastructure',
            'Implement and manage CI/CD pipelines',
            'Monitor system performance and reliability',
            'Automate deployment and scaling processes',
            'Collaborate with development teams'
        ],
        salary: {
            min: 130000,
            max: 170000,
            currency: 'USD'
        },
        status: 'published' as const
    },
    {
        title: 'Product Manager',
        company: 'Innovation Labs',
        location: 'Boston, MA',
        description: 'We need an experienced product manager to lead product strategy and work with cross-functional teams to deliver exceptional products.',
        employmentType: 'Full-time' as const,
        requirements: [
            'MBA or equivalent experience',
            '5+ years of product management experience',
            'Strong analytical and problem-solving skills',
            'Experience with agile development methodologies',
            'Excellent communication and leadership skills'
        ],
        responsibilities: [
            'Define product strategy and roadmap',
            'Gather and prioritize product requirements',
            'Work with engineering and design teams',
            'Analyze market trends and user feedback',
            'Present to executives and stakeholders'
        ],
        salary: {
            min: 140000,
            max: 180000,
            currency: 'USD'
        },
        status: 'published' as const
    }
];

// Function to test database connection
export async function testDatabaseConnection(): Promise<boolean> {
    console.log('🔍 Testing database connection...');

    try {
        const connectionResult = await checkFirebaseConnection();
        if (connectionResult.success) {
            console.log('✅ Database connection successful!');
            return true;
        } else {
            console.error('❌ Database connection failed:', connectionResult.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Database connection test failed:', error);
        return false;
    }
}

// Function to check if data already exists
export async function checkExistingData(): Promise<{ candidates: number; jobs: number }> {
    try {
        const [candidates, jobs] = await Promise.all([
            getCandidates(),
            getJobs()
        ]);

        console.log(`📊 Found ${candidates.length} candidates and ${jobs.length} jobs in database`);
        return { candidates: candidates.length, jobs: jobs.length };
    } catch (error) {
        console.error('Error checking existing data:', error);
        return { candidates: 0, jobs: 0 };
    }
}

// Function to seed candidates
export async function seedCandidates(): Promise<string[]> {
    console.log('👥 Seeding candidates...');
    const candidateIds: string[] = [];

    for (const candidateData of sampleCandidates) {
        try {
            const candidate = await createCandidate(candidateData);
            candidateIds.push(candidate.id);
            console.log(`✅ Created candidate: ${candidate.firstName} ${candidate.lastName}`);
        } catch (error) {
            console.error(`❌ Failed to create candidate ${candidateData.firstName} ${candidateData.lastName}:`, error);
        }
    }

    return candidateIds;
}

// Function to seed jobs
export async function seedJobs(): Promise<string[]> {
    console.log('💼 Seeding jobs...');
    const jobIds: string[] = [];

    for (const jobData of sampleJobs) {
        try {
            const job = await createJob(jobData);
            jobIds.push(job.id);
            console.log(`✅ Created job: ${job.title} at ${job.company}`);
        } catch (error) {
            console.error(`❌ Failed to create job ${jobData.title}:`, error);
        }
    }

    return jobIds;
}

// Function to create sample applications
export async function seedApplications(candidateIds: string[], jobIds: string[]): Promise<void> {
    console.log('📝 Creating sample applications...');

    const applicationStatuses: Array<'applied' | 'review' | 'interview' | 'offer' | 'rejected' | 'accepted'> =
        ['applied', 'review', 'interview', 'offer', 'rejected', 'accepted'];

    // Create some random applications
    for (let i = 0; i < Math.min(candidateIds.length * 2, 15); i++) {
        try {
            const candidateId = candidateIds[Math.floor(Math.random() * candidateIds.length)];
            const jobId = jobIds[Math.floor(Math.random() * jobIds.length)];
            const status = applicationStatuses[Math.floor(Math.random() * applicationStatuses.length)];
            const matchScore = Math.floor(Math.random() * 40) + 60; // Score between 60-100

            await createJobApplication(candidateId, jobId, {
                status,
                matchScore,
                notes: `Application processed automatically. Match score: ${matchScore}%`
            });

            console.log(`✅ Created application: Candidate ${candidateId.slice(0, 8)}... → Job ${jobId.slice(0, 8)}... (${status})`);
        } catch (error) {
            console.error('❌ Failed to create application:', error);
        }
    }
}

// Main seeding function
export async function seedDatabase(force: boolean = false): Promise<void> {
    console.log('🌱 Starting database seeding process...');

    // Test connection first
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
        console.error('❌ Cannot proceed without database connection');
        return;
    }

    // Check existing data
    const existingData = await checkExistingData();

    if (!force && (existingData.candidates > 0 || existingData.jobs > 0)) {
        console.log('⚠️  Database already contains data. Use force=true to add more data anyway.');
        console.log('   Existing data:', existingData);
        return;
    }

    try {
        // Seed data
        const [candidateIds, jobIds] = await Promise.all([
            seedCandidates(),
            seedJobs()
        ]);

        // Create applications
        if (candidateIds.length > 0 && jobIds.length > 0) {
            await seedApplications(candidateIds, jobIds);
        }

        console.log('🎉 Database seeding completed successfully!');
        console.log(`   Created: ${candidateIds.length} candidates, ${jobIds.length} jobs`);

        // Final verification
        const finalData = await checkExistingData();
        console.log('📊 Final database state:', finalData);

    } catch (error) {
        console.error('❌ Database seeding failed:', error);
    }
}

// Export for use in browser console or scripts
if (typeof window !== 'undefined') {
    (window as any).seedDatabase = seedDatabase;
    (window as any).testDatabaseConnection = testDatabaseConnection;
    (window as any).checkExistingData = checkExistingData;
} 