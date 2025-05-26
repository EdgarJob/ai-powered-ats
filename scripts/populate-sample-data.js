import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from frontend/.env
const envPath = join(__dirname, '../frontend/.env');
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

// Job categories - inline definition to avoid import issues
const JOB_CATEGORIES = [
    { id: 'information-technology', name: 'Information Technology', subcategories: ['Software Development', 'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning/AI', 'Cybersecurity', 'DevOps', 'Cloud Computing', 'Database Administration', 'IT Support', 'Network Administration', 'Quality Assurance', 'UI/UX Design', 'Product Management', 'Technical Writing'] },
    { id: 'human-resources', name: 'Human Resources', subcategories: ['HR Management', 'Recruitment', 'Training & Development', 'Employee Relations', 'Compensation & Benefits', 'HR Analytics', 'Organizational Development', 'Performance Management', 'HR Compliance', 'Talent Acquisition'] },
    { id: 'administration', name: 'Administration', subcategories: ['Executive Assistant', 'Administrative Assistant', 'Office Manager', 'Data Entry', 'Reception', 'Document Management', 'Scheduling', 'Customer Service', 'General Administration', 'Virtual Assistant'] },
    { id: 'audit-compliance', name: 'Audit & Compliance', subcategories: ['Internal Audit', 'External Audit', 'Compliance Officer', 'Risk Management', 'Financial Audit', 'IT Audit', 'Operational Audit', 'Regulatory Compliance', 'Quality Assurance', 'Fraud Investigation'] },
    { id: 'monitoring-evaluation', name: 'Monitoring & Evaluation', subcategories: ['M&E Officer', 'Research Analyst', 'Data Analyst', 'Program Evaluation', 'Impact Assessment', 'Survey Design', 'Statistical Analysis', 'Report Writing', 'Database Management', 'Field Monitoring'] },
    { id: 'finance-accounting', name: 'Finance & Accounting', subcategories: ['Accountant', 'Financial Analyst', 'Budget Analyst', 'Tax Specialist', 'Bookkeeper', 'Financial Controller', 'Treasury Management', 'Investment Analysis', 'Cost Accounting', 'Financial Planning'] },
    { id: 'marketing-communications', name: 'Marketing & Communications', subcategories: ['Digital Marketing', 'Content Marketing', 'Social Media Management', 'Public Relations', 'Brand Management', 'Communications', 'Graphic Design', 'Marketing Analytics', 'Event Management', 'Copywriting'] },
    { id: 'sales-business-development', name: 'Sales & Business Development', subcategories: ['Sales Representative', 'Business Development', 'Account Management', 'Sales Manager', 'Customer Success', 'Lead Generation', 'Partnership Development', 'Territory Management', 'Inside Sales', 'Field Sales'] },
    { id: 'operations-logistics', name: 'Operations & Logistics', subcategories: ['Operations Manager', 'Supply Chain Management', 'Logistics Coordinator', 'Warehouse Management', 'Process Improvement', 'Quality Control', 'Inventory Management', 'Production Planning', 'Procurement', 'Vendor Management'] },
    { id: 'healthcare-medical', name: 'Healthcare & Medical', subcategories: ['Physician', 'Nurse', 'Medical Assistant', 'Healthcare Administration', 'Medical Records', 'Pharmacy', 'Laboratory Technician', 'Radiology', 'Physical Therapy', 'Mental Health'] },
    { id: 'education-training', name: 'Education & Training', subcategories: ['Teacher', 'Professor', 'Training Specialist', 'Curriculum Developer', 'Education Administrator', 'Academic Advisor', 'Instructional Designer', 'Educational Technology', 'Student Services', 'Research'] },
    { id: 'legal-regulatory', name: 'Legal & Regulatory', subcategories: ['Lawyer', 'Legal Assistant', 'Paralegal', 'Regulatory Affairs', 'Contract Management', 'Intellectual Property', 'Corporate Law', 'Litigation', 'Legal Research', 'Compliance'] },
    { id: 'engineering-technical', name: 'Engineering & Technical', subcategories: ['Software Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Civil Engineer', 'Chemical Engineer', 'Industrial Engineer', 'Environmental Engineer', 'Technical Specialist', 'Research & Development', 'Project Engineer'] },
    { id: 'consulting-advisory', name: 'Consulting & Advisory', subcategories: ['Management Consultant', 'Strategy Consultant', 'Business Analyst', 'Process Consultant', 'Technology Consultant', 'Financial Advisor', 'Change Management', 'Project Management', 'Strategic Planning', 'Organizational Development'] },
    { id: 'creative-design', name: 'Creative & Design', subcategories: ['Graphic Designer', 'Web Designer', 'UI/UX Designer', 'Content Creator', 'Video Production', 'Photography', 'Creative Director', 'Art Director', 'Copywriter', 'Brand Designer'] },
    { id: 'other', name: 'Other', subcategories: ['General Labor', 'Security', 'Maintenance', 'Transportation', 'Hospitality', 'Retail', 'Food Service', 'Real Estate', 'Insurance', 'Non-Profit'] }
];

// Firebase configuration - using environment variables
const firebaseConfig = {
    apiKey: envVars.VITE_FIREBASE_API_KEY,
    authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: envVars.VITE_FIREBASE_PROJECT_ID,
    storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: envVars.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to generate random dates
function getRandomDateInRange(startDate, endDate) {
    const start = startDate.getTime();
    const end = endDate.getTime();
    return new Date(start + Math.random() * (end - start));
}

// Helper function to get random items from array
function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Sample job data for each category
const jobTemplates = {
    'information-technology': [
        {
            title: 'Senior Full Stack Developer',
            company: 'TechCorp Solutions',
            description: 'Join our dynamic team to build cutting-edge web applications using modern technologies.',
            requirements: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
            responsibilities: ['Develop scalable web applications', 'Collaborate with cross-functional teams', 'Code reviews and mentoring', 'System architecture design'],
            employmentType: 'Full-time',
            salary: { min: 120000, max: 160000, currency: 'USD' }
        },
        {
            title: 'DevOps Engineer',
            company: 'CloudFirst Inc',
            description: 'Manage and optimize our cloud infrastructure and deployment pipelines.',
            requirements: ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform', 'Python'],
            responsibilities: ['Manage CI/CD pipelines', 'Monitor system performance', 'Automate deployment processes', 'Ensure security compliance'],
            employmentType: 'Full-time',
            salary: { min: 110000, max: 150000, currency: 'USD' }
        },
        {
            title: 'Data Scientist',
            company: 'Analytics Pro',
            description: 'Analyze complex datasets to drive business insights and machine learning solutions.',
            requirements: ['Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'Statistics'],
            responsibilities: ['Build predictive models', 'Analyze large datasets', 'Create data visualizations', 'Present findings to stakeholders'],
            employmentType: 'Full-time',
            salary: { min: 130000, max: 170000, currency: 'USD' }
        }
    ],
    'human-resources': [
        {
            title: 'HR Business Partner',
            company: 'Global Enterprises',
            description: 'Strategic HR partner supporting business units with talent management and organizational development.',
            requirements: ['HR Management', 'Employee Relations', 'Performance Management', 'HRIS', 'Labor Law'],
            responsibilities: ['Partner with business leaders', 'Manage employee relations', 'Drive talent development', 'Ensure compliance'],
            employmentType: 'Full-time',
            salary: { min: 85000, max: 115000, currency: 'USD' }
        },
        {
            title: 'Talent Acquisition Specialist',
            company: 'Recruitment Excellence',
            description: 'Lead recruitment efforts to attract top talent across various departments.',
            requirements: ['Recruitment', 'Interviewing', 'ATS Systems', 'LinkedIn Recruiting', 'Employer Branding'],
            responsibilities: ['Source and screen candidates', 'Conduct interviews', 'Manage recruitment pipeline', 'Build talent networks'],
            employmentType: 'Full-time',
            salary: { min: 65000, max: 85000, currency: 'USD' }
        },
        {
            title: 'Compensation & Benefits Analyst',
            company: 'Benefits Solutions Corp',
            description: 'Design and analyze compensation structures and benefits programs.',
            requirements: ['Compensation Analysis', 'Benefits Administration', 'Excel', 'HRIS', 'Market Research'],
            responsibilities: ['Analyze compensation data', 'Design benefits programs', 'Conduct market surveys', 'Support salary planning'],
            employmentType: 'Full-time',
            salary: { min: 70000, max: 95000, currency: 'USD' }
        }
    ],
    'finance-accounting': [
        {
            title: 'Senior Financial Analyst',
            company: 'Financial Services Group',
            description: 'Provide financial analysis and reporting to support strategic business decisions.',
            requirements: ['Financial Analysis', 'Excel', 'SQL', 'Financial Modeling', 'CPA', 'Budgeting'],
            responsibilities: ['Prepare financial reports', 'Conduct variance analysis', 'Support budgeting process', 'Present to management'],
            employmentType: 'Full-time',
            salary: { min: 80000, max: 110000, currency: 'USD' }
        },
        {
            title: 'Tax Manager',
            company: 'Accounting Partners LLC',
            description: 'Manage tax compliance and planning for corporate clients.',
            requirements: ['Tax Preparation', 'CPA', 'Tax Law', 'QuickBooks', 'Excel', 'Client Management'],
            responsibilities: ['Prepare tax returns', 'Tax planning strategies', 'Client consultations', 'Compliance monitoring'],
            employmentType: 'Full-time',
            salary: { min: 90000, max: 125000, currency: 'USD' }
        },
        {
            title: 'Budget Analyst',
            company: 'Municipal Finance Department',
            description: 'Analyze budget proposals and monitor spending for government operations.',
            requirements: ['Budget Analysis', 'Government Accounting', 'Excel', 'Financial Reporting', 'Public Administration'],
            responsibilities: ['Review budget proposals', 'Monitor expenditures', 'Prepare financial reports', 'Support budget hearings'],
            employmentType: 'Full-time',
            salary: { min: 65000, max: 85000, currency: 'USD' }
        }
    ],
    'marketing-communications': [
        {
            title: 'Digital Marketing Manager',
            company: 'Creative Agency Plus',
            description: 'Lead digital marketing campaigns across multiple channels to drive brand awareness.',
            requirements: ['Digital Marketing', 'Google Analytics', 'SEO/SEM', 'Social Media', 'Content Marketing', 'Adobe Creative Suite'],
            responsibilities: ['Develop marketing strategies', 'Manage digital campaigns', 'Analyze performance metrics', 'Lead creative projects'],
            employmentType: 'Full-time',
            salary: { min: 75000, max: 105000, currency: 'USD' }
        },
        {
            title: 'Content Marketing Specialist',
            company: 'Brand Builders Inc',
            description: 'Create compelling content to engage audiences and drive conversions.',
            requirements: ['Content Writing', 'SEO', 'WordPress', 'Social Media', 'Analytics', 'Copywriting'],
            responsibilities: ['Create blog content', 'Manage social media', 'Optimize for SEO', 'Track content performance'],
            employmentType: 'Full-time',
            salary: { min: 55000, max: 75000, currency: 'USD' }
        },
        {
            title: 'Brand Manager',
            company: 'Consumer Goods Corp',
            description: 'Manage brand strategy and positioning for consumer products.',
            requirements: ['Brand Management', 'Market Research', 'Product Marketing', 'Project Management', 'Analytics'],
            responsibilities: ['Develop brand strategies', 'Manage product launches', 'Conduct market research', 'Coordinate with agencies'],
            employmentType: 'Full-time',
            salary: { min: 85000, max: 115000, currency: 'USD' }
        }
    ],
    'sales-business-development': [
        {
            title: 'Enterprise Sales Manager',
            company: 'Software Solutions Ltd',
            description: 'Drive enterprise sales for B2B software solutions.',
            requirements: ['B2B Sales', 'CRM', 'Salesforce', 'Negotiation', 'Account Management', 'SaaS'],
            responsibilities: ['Manage enterprise accounts', 'Develop sales strategies', 'Negotiate contracts', 'Meet revenue targets'],
            employmentType: 'Full-time',
            salary: { min: 95000, max: 140000, currency: 'USD' }
        },
        {
            title: 'Business Development Representative',
            company: 'Growth Partners',
            description: 'Generate new business opportunities through outbound prospecting.',
            requirements: ['Lead Generation', 'Cold Calling', 'Email Marketing', 'CRM', 'Sales Prospecting'],
            responsibilities: ['Prospect new clients', 'Qualify leads', 'Schedule demos', 'Maintain CRM data'],
            employmentType: 'Full-time',
            salary: { min: 45000, max: 65000, currency: 'USD' }
        },
        {
            title: 'Customer Success Manager',
            company: 'Client First Solutions',
            description: 'Ensure customer satisfaction and drive account growth.',
            requirements: ['Customer Success', 'Account Management', 'SaaS', 'Analytics', 'Communication'],
            responsibilities: ['Manage customer relationships', 'Drive product adoption', 'Identify upsell opportunities', 'Resolve customer issues'],
            employmentType: 'Full-time',
            salary: { min: 70000, max: 95000, currency: 'USD' }
        }
    ],
    'administration': [
        {
            title: 'Executive Assistant',
            company: 'Corporate Headquarters',
            description: 'Provide high-level administrative support to executive team.',
            requirements: ['Administrative Support', 'Microsoft Office', 'Calendar Management', 'Communication', 'Organization'],
            responsibilities: ['Manage executive calendars', 'Coordinate meetings', 'Handle correspondence', 'Travel arrangements'],
            employmentType: 'Full-time',
            salary: { min: 55000, max: 75000, currency: 'USD' }
        },
        {
            title: 'Office Manager',
            company: 'Business Solutions Inc',
            description: 'Oversee daily office operations and administrative functions.',
            requirements: ['Office Management', 'Team Leadership', 'Vendor Management', 'Budget Management', 'Problem Solving'],
            responsibilities: ['Manage office operations', 'Supervise admin staff', 'Coordinate with vendors', 'Maintain office supplies'],
            employmentType: 'Full-time',
            salary: { min: 50000, max: 70000, currency: 'USD' }
        },
        {
            title: 'Administrative Coordinator',
            company: 'Professional Services Group',
            description: 'Coordinate administrative activities across multiple departments.',
            requirements: ['Data Entry', 'Filing Systems', 'Customer Service', 'Multi-tasking', 'Attention to Detail'],
            responsibilities: ['Process documentation', 'Maintain records', 'Support multiple departments', 'Handle inquiries'],
            employmentType: 'Full-time',
            salary: { min: 40000, max: 55000, currency: 'USD' }
        }
    ],
    'audit-compliance': [
        {
            title: 'Internal Auditor',
            company: 'Financial Compliance Corp',
            description: 'Conduct internal audits to ensure compliance with regulations and policies.',
            requirements: ['Internal Audit', 'Risk Assessment', 'Financial Analysis', 'Compliance', 'CPA'],
            responsibilities: ['Perform audit procedures', 'Assess internal controls', 'Prepare audit reports', 'Recommend improvements'],
            employmentType: 'Full-time',
            salary: { min: 75000, max: 105000, currency: 'USD' }
        },
        {
            title: 'Compliance Officer',
            company: 'Regulatory Solutions LLC',
            description: 'Ensure organizational compliance with laws and regulations.',
            requirements: ['Regulatory Compliance', 'Risk Management', 'Policy Development', 'Legal Knowledge', 'Analytical Skills'],
            responsibilities: ['Monitor compliance', 'Develop policies', 'Conduct training', 'Manage regulatory relationships'],
            employmentType: 'Full-time',
            salary: { min: 85000, max: 115000, currency: 'USD' }
        },
        {
            title: 'Risk Analyst',
            company: 'Risk Management Partners',
            description: 'Analyze and assess various business risks.',
            requirements: ['Risk Analysis', 'Statistical Analysis', 'Financial Modeling', 'Excel', 'Report Writing'],
            responsibilities: ['Identify risks', 'Analyze risk factors', 'Prepare risk reports', 'Recommend mitigation strategies'],
            employmentType: 'Full-time',
            salary: { min: 70000, max: 95000, currency: 'USD' }
        }
    ],
    'monitoring-evaluation': [
        {
            title: 'M&E Specialist',
            company: 'Development Programs Inc',
            description: 'Design and implement monitoring and evaluation frameworks.',
            requirements: ['M&E Framework', 'Data Analysis', 'Statistical Software', 'Report Writing', 'Project Management'],
            responsibilities: ['Design M&E systems', 'Collect and analyze data', 'Prepare evaluation reports', 'Train staff on M&E'],
            employmentType: 'Full-time',
            salary: { min: 65000, max: 85000, currency: 'USD' }
        },
        {
            title: 'Research Analyst',
            company: 'Policy Research Institute',
            description: 'Conduct research and analysis to support policy development.',
            requirements: ['Research Methods', 'Data Analysis', 'SPSS', 'Survey Design', 'Academic Writing'],
            responsibilities: ['Design research studies', 'Collect data', 'Analyze findings', 'Write research reports'],
            employmentType: 'Full-time',
            salary: { min: 60000, max: 80000, currency: 'USD' }
        },
        {
            title: 'Program Evaluator',
            company: 'Evaluation Services Group',
            description: 'Evaluate program effectiveness and impact.',
            requirements: ['Program Evaluation', 'Impact Assessment', 'Qualitative Methods', 'Quantitative Analysis', 'Stakeholder Engagement'],
            responsibilities: ['Conduct evaluations', 'Assess program impact', 'Engage stakeholders', 'Present findings'],
            employmentType: 'Contract',
            salary: { min: 70000, max: 90000, currency: 'USD' }
        }
    ],
    'operations-logistics': [
        {
            title: 'Operations Manager',
            company: 'Manufacturing Solutions',
            description: 'Oversee daily operations and optimize business processes.',
            requirements: ['Operations Management', 'Process Improvement', 'Team Leadership', 'Supply Chain', 'Lean Manufacturing'],
            responsibilities: ['Manage operations', 'Optimize processes', 'Lead teams', 'Ensure quality standards'],
            employmentType: 'Full-time',
            salary: { min: 80000, max: 110000, currency: 'USD' }
        },
        {
            title: 'Supply Chain Coordinator',
            company: 'Global Logistics Corp',
            description: 'Coordinate supply chain activities and vendor relationships.',
            requirements: ['Supply Chain Management', 'Vendor Management', 'Inventory Control', 'ERP Systems', 'Negotiation'],
            responsibilities: ['Coordinate suppliers', 'Manage inventory', 'Track shipments', 'Optimize costs'],
            employmentType: 'Full-time',
            salary: { min: 60000, max: 80000, currency: 'USD' }
        },
        {
            title: 'Logistics Specialist',
            company: 'Distribution Networks',
            description: 'Manage logistics operations and transportation coordination.',
            requirements: ['Logistics', 'Transportation', 'Warehouse Management', 'Route Optimization', 'Customer Service'],
            responsibilities: ['Plan shipments', 'Coordinate transportation', 'Track deliveries', 'Resolve logistics issues'],
            employmentType: 'Full-time',
            salary: { min: 50000, max: 70000, currency: 'USD' }
        }
    ],
    'healthcare-medical': [
        {
            title: 'Registered Nurse',
            company: 'City General Hospital',
            description: 'Provide patient care and support medical treatments.',
            requirements: ['RN License', 'Patient Care', 'Medical Knowledge', 'Communication', 'Critical Thinking'],
            responsibilities: ['Provide patient care', 'Administer medications', 'Monitor vital signs', 'Educate patients'],
            employmentType: 'Full-time',
            salary: { min: 70000, max: 90000, currency: 'USD' }
        },
        {
            title: 'Medical Assistant',
            company: 'Family Practice Clinic',
            description: 'Assist physicians with patient care and administrative tasks.',
            requirements: ['Medical Assistant Certification', 'Clinical Skills', 'Administrative Skills', 'EMR', 'Patient Communication'],
            responsibilities: ['Assist with examinations', 'Take vital signs', 'Schedule appointments', 'Maintain records'],
            employmentType: 'Full-time',
            salary: { min: 35000, max: 45000, currency: 'USD' }
        },
        {
            title: 'Healthcare Administrator',
            company: 'Regional Medical Center',
            description: 'Manage healthcare facility operations and administration.',
            requirements: ['Healthcare Administration', 'Healthcare Regulations', 'Budget Management', 'Leadership', 'Quality Improvement'],
            responsibilities: ['Manage operations', 'Ensure compliance', 'Oversee budgets', 'Lead improvement initiatives'],
            employmentType: 'Full-time',
            salary: { min: 85000, max: 120000, currency: 'USD' }
        }
    ],
    'education-training': [
        {
            title: 'Training Specialist',
            company: 'Corporate Learning Solutions',
            description: 'Design and deliver training programs for employees.',
            requirements: ['Instructional Design', 'Training Delivery', 'Learning Management Systems', 'Curriculum Development', 'Adult Learning'],
            responsibilities: ['Design training programs', 'Deliver workshops', 'Assess learning outcomes', 'Update training materials'],
            employmentType: 'Full-time',
            salary: { min: 60000, max: 80000, currency: 'USD' }
        },
        {
            title: 'Curriculum Developer',
            company: 'Educational Content Inc',
            description: 'Develop educational curricula and learning materials.',
            requirements: ['Curriculum Development', 'Educational Technology', 'Subject Matter Expertise', 'Project Management', 'Assessment Design'],
            responsibilities: ['Develop curricula', 'Create learning materials', 'Design assessments', 'Collaborate with educators'],
            employmentType: 'Full-time',
            salary: { min: 65000, max: 85000, currency: 'USD' }
        },
        {
            title: 'Academic Advisor',
            company: 'State University',
            description: 'Provide academic guidance and support to students.',
            requirements: ['Academic Advising', 'Student Services', 'Higher Education', 'Communication', 'Problem Solving'],
            responsibilities: ['Advise students', 'Plan academic programs', 'Monitor progress', 'Provide support services'],
            employmentType: 'Full-time',
            salary: { min: 45000, max: 65000, currency: 'USD' }
        }
    ],
    'legal-regulatory': [
        {
            title: 'Legal Counsel',
            company: 'Corporate Legal Services',
            description: 'Provide legal advice and support to business operations.',
            requirements: ['JD Degree', 'Bar Admission', 'Corporate Law', 'Contract Law', 'Legal Research'],
            responsibilities: ['Provide legal advice', 'Review contracts', 'Manage legal risks', 'Handle litigation'],
            employmentType: 'Full-time',
            salary: { min: 120000, max: 180000, currency: 'USD' }
        },
        {
            title: 'Paralegal',
            company: 'Law Firm Associates',
            description: 'Assist attorneys with legal research and document preparation.',
            requirements: ['Paralegal Certificate', 'Legal Research', 'Document Preparation', 'Case Management', 'Legal Software'],
            responsibilities: ['Conduct legal research', 'Prepare documents', 'Assist with cases', 'Maintain files'],
            employmentType: 'Full-time',
            salary: { min: 45000, max: 65000, currency: 'USD' }
        },
        {
            title: 'Regulatory Affairs Specialist',
            company: 'Pharmaceutical Compliance',
            description: 'Ensure compliance with regulatory requirements in pharmaceutical industry.',
            requirements: ['Regulatory Affairs', 'FDA Regulations', 'Pharmaceutical Knowledge', 'Documentation', 'Project Management'],
            responsibilities: ['Manage regulatory submissions', 'Ensure compliance', 'Coordinate with agencies', 'Maintain documentation'],
            employmentType: 'Full-time',
            salary: { min: 80000, max: 110000, currency: 'USD' }
        }
    ],
    'engineering-technical': [
        {
            title: 'Mechanical Engineer',
            company: 'Engineering Solutions Inc',
            description: 'Design and develop mechanical systems and products.',
            requirements: ['Mechanical Engineering Degree', 'CAD Software', 'Product Design', 'Manufacturing', 'Project Management'],
            responsibilities: ['Design mechanical systems', 'Conduct testing', 'Collaborate with teams', 'Ensure quality standards'],
            employmentType: 'Full-time',
            salary: { min: 75000, max: 105000, currency: 'USD' }
        },
        {
            title: 'Electrical Engineer',
            company: 'Power Systems Corp',
            description: 'Design electrical systems and components.',
            requirements: ['Electrical Engineering Degree', 'Circuit Design', 'Power Systems', 'MATLAB', 'Problem Solving'],
            responsibilities: ['Design electrical systems', 'Analyze circuits', 'Test components', 'Troubleshoot issues'],
            employmentType: 'Full-time',
            salary: { min: 80000, max: 110000, currency: 'USD' }
        },
        {
            title: 'Project Engineer',
            company: 'Construction Management',
            description: 'Manage engineering projects from conception to completion.',
            requirements: ['Engineering Degree', 'Project Management', 'Technical Writing', 'Team Leadership', 'Quality Control'],
            responsibilities: ['Manage projects', 'Coordinate teams', 'Ensure quality', 'Monitor budgets'],
            employmentType: 'Full-time',
            salary: { min: 70000, max: 95000, currency: 'USD' }
        }
    ],
    'consulting-advisory': [
        {
            title: 'Management Consultant',
            company: 'Strategic Consulting Group',
            description: 'Provide strategic advice to improve business performance.',
            requirements: ['Management Consulting', 'Strategic Planning', 'Business Analysis', 'Presentation Skills', 'MBA'],
            responsibilities: ['Analyze business problems', 'Develop solutions', 'Present recommendations', 'Implement changes'],
            employmentType: 'Full-time',
            salary: { min: 100000, max: 150000, currency: 'USD' }
        },
        {
            title: 'Business Analyst',
            company: 'Process Improvement Partners',
            description: 'Analyze business processes and recommend improvements.',
            requirements: ['Business Analysis', 'Process Mapping', 'Requirements Gathering', 'SQL', 'Project Management'],
            responsibilities: ['Analyze processes', 'Gather requirements', 'Document workflows', 'Recommend improvements'],
            employmentType: 'Full-time',
            salary: { min: 70000, max: 95000, currency: 'USD' }
        },
        {
            title: 'Strategy Consultant',
            company: 'Executive Advisory Services',
            description: 'Develop strategic plans and growth strategies for clients.',
            requirements: ['Strategic Planning', 'Market Analysis', 'Financial Modeling', 'Presentation Skills', 'Industry Knowledge'],
            responsibilities: ['Develop strategies', 'Conduct market research', 'Create financial models', 'Present to executives'],
            employmentType: 'Contract',
            salary: { min: 120000, max: 180000, currency: 'USD' }
        }
    ],
    'creative-design': [
        {
            title: 'Graphic Designer',
            company: 'Creative Studio Plus',
            description: 'Create visual designs for print and digital media.',
            requirements: ['Graphic Design', 'Adobe Creative Suite', 'Typography', 'Brand Design', 'Creative Thinking'],
            responsibilities: ['Create visual designs', 'Develop brand materials', 'Collaborate with clients', 'Manage projects'],
            employmentType: 'Full-time',
            salary: { min: 50000, max: 70000, currency: 'USD' }
        },
        {
            title: 'UX/UI Designer',
            company: 'Digital Experience Agency',
            description: 'Design user experiences and interfaces for digital products.',
            requirements: ['UX/UI Design', 'Figma', 'User Research', 'Prototyping', 'Usability Testing'],
            responsibilities: ['Design user interfaces', 'Conduct user research', 'Create prototypes', 'Test usability'],
            employmentType: 'Full-time',
            salary: { min: 75000, max: 105000, currency: 'USD' }
        },
        {
            title: 'Creative Director',
            company: 'Advertising Innovations',
            description: 'Lead creative teams and oversee creative projects.',
            requirements: ['Creative Direction', 'Team Leadership', 'Brand Strategy', 'Campaign Development', 'Portfolio Management'],
            responsibilities: ['Lead creative teams', 'Develop campaigns', 'Manage client relationships', 'Ensure quality output'],
            employmentType: 'Full-time',
            salary: { min: 95000, max: 135000, currency: 'USD' }
        }
    ],
    'other': [
        {
            title: 'Security Guard',
            company: 'Professional Security Services',
            description: 'Provide security services for commercial properties.',
            requirements: ['Security License', 'Physical Fitness', 'Attention to Detail', 'Communication', 'Emergency Response'],
            responsibilities: ['Monitor premises', 'Patrol areas', 'Write reports', 'Respond to incidents'],
            employmentType: 'Full-time',
            salary: { min: 35000, max: 45000, currency: 'USD' }
        },
        {
            title: 'Maintenance Technician',
            company: 'Facility Management Corp',
            description: 'Maintain and repair building systems and equipment.',
            requirements: ['Maintenance Skills', 'Electrical Knowledge', 'Plumbing', 'HVAC', 'Problem Solving'],
            responsibilities: ['Perform maintenance', 'Repair equipment', 'Respond to requests', 'Maintain records'],
            employmentType: 'Full-time',
            salary: { min: 40000, max: 60000, currency: 'USD' }
        },
        {
            title: 'Customer Service Representative',
            company: 'Customer Care Solutions',
            description: 'Provide customer support and resolve inquiries.',
            requirements: ['Customer Service', 'Communication', 'Problem Solving', 'Computer Skills', 'Patience'],
            responsibilities: ['Handle customer inquiries', 'Resolve issues', 'Process orders', 'Maintain records'],
            employmentType: 'Full-time',
            salary: { min: 35000, max: 50000, currency: 'USD' }
        }
    ]
};

// Sample candidate data for each profession
const candidateTemplates = {
    'information-technology': [
        {
            firstName: 'Alex', lastName: 'Chen', email: 'alex.chen@email.com', phone: '(555) 101-2001',
            location: 'San Francisco, CA', currentPosition: 'Senior Software Engineer', yearsOfExperience: 8,
            specialization: 'Software Development',
            skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'MongoDB'],
            education: [{ degree: 'B.S. Computer Science', institution: 'UC Berkeley', year: 2016 }]
        },
        {
            firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@email.com', phone: '(555) 102-2002',
            location: 'Seattle, WA', currentPosition: 'Full Stack Developer', yearsOfExperience: 5,
            specialization: 'Web Development',
            skills: ['TypeScript', 'Angular', 'Express.js', 'PostgreSQL', 'Git', 'Agile'],
            education: [{ degree: 'B.S. Software Engineering', institution: 'University of Washington', year: 2019 }]
        },
        {
            firstName: 'Michael', lastName: 'Rodriguez', email: 'michael.rodriguez@email.com', phone: '(555) 103-2003',
            location: 'Austin, TX', currentPosition: 'Junior Developer', yearsOfExperience: 2,
            specialization: 'Mobile Development',
            skills: ['React Native', 'Swift', 'Kotlin', 'Firebase', 'REST APIs'],
            education: [{ degree: 'B.S. Computer Science', institution: 'UT Austin', year: 2022 }]
        },
        {
            firstName: 'Emily', lastName: 'Wang', email: 'emily.wang@email.com', phone: '(555) 104-2004',
            location: 'New York, NY', currentPosition: 'Lead DevOps Engineer', yearsOfExperience: 12,
            specialization: 'DevOps',
            skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Jenkins', 'Python', 'Linux'],
            education: [{ degree: 'M.S. Computer Science', institution: 'Columbia University', year: 2012 }]
        }
    ],
    'human-resources': [
        {
            firstName: 'Jessica', lastName: 'Thompson', email: 'jessica.thompson@email.com', phone: '(555) 201-3001',
            location: 'Chicago, IL', currentPosition: 'HR Business Partner', yearsOfExperience: 7,
            specialization: 'HR Management',
            skills: ['Employee Relations', 'Performance Management', 'HRIS', 'Talent Development', 'Labor Law'],
            education: [{ degree: 'M.A. Human Resources', institution: 'Northwestern University', year: 2017 }]
        },
        {
            firstName: 'David', lastName: 'Martinez', email: 'david.martinez@email.com', phone: '(555) 202-3002',
            location: 'Los Angeles, CA', currentPosition: 'Recruiter', yearsOfExperience: 4,
            specialization: 'Recruitment',
            skills: ['Talent Acquisition', 'Interviewing', 'LinkedIn Recruiting', 'ATS', 'Employer Branding'],
            education: [{ degree: 'B.A. Psychology', institution: 'UCLA', year: 2020 }]
        },
        {
            firstName: 'Lisa', lastName: 'Brown', email: 'lisa.brown@email.com', phone: '(555) 203-3003',
            location: 'Atlanta, GA', currentPosition: 'HR Coordinator', yearsOfExperience: 2,
            specialization: 'HR Administration',
            skills: ['HRIS', 'Benefits Administration', 'Payroll', 'Employee Onboarding', 'Compliance'],
            education: [{ degree: 'B.A. Business Administration', institution: 'Georgia State University', year: 2022 }]
        },
        {
            firstName: 'Robert', lastName: 'Davis', email: 'robert.davis@email.com', phone: '(555) 204-3004',
            location: 'Boston, MA', currentPosition: 'VP of Human Resources', yearsOfExperience: 15,
            specialization: 'HR Leadership',
            skills: ['Strategic HR', 'Organizational Development', 'Change Management', 'Executive Coaching', 'M&A'],
            education: [{ degree: 'MBA', institution: 'Harvard Business School', year: 2009 }]
        }
    ],
    'finance-accounting': [
        {
            firstName: 'Jennifer', lastName: 'Wilson', email: 'jennifer.wilson@email.com', phone: '(555) 301-4001',
            location: 'New York, NY', currentPosition: 'Senior Financial Analyst', yearsOfExperience: 6,
            specialization: 'Financial Analysis',
            skills: ['Financial Modeling', 'Excel', 'SQL', 'Budgeting', 'Variance Analysis', 'PowerBI'],
            education: [{ degree: 'B.S. Finance', institution: 'NYU Stern', year: 2018 }]
        },
        {
            firstName: 'Mark', lastName: 'Anderson', email: 'mark.anderson@email.com', phone: '(555) 302-4002',
            location: 'Chicago, IL', currentPosition: 'Staff Accountant', yearsOfExperience: 3,
            specialization: 'Accounting',
            skills: ['General Ledger', 'QuickBooks', 'Tax Preparation', 'Financial Reporting', 'Reconciliation'],
            education: [{ degree: 'B.S. Accounting', institution: 'University of Illinois', year: 2021 }]
        },
        {
            firstName: 'Rachel', lastName: 'Kim', email: 'rachel.kim@email.com', phone: '(555) 303-4003',
            location: 'Los Angeles, CA', currentPosition: 'Junior Analyst', yearsOfExperience: 1,
            specialization: 'Budget Analysis',
            skills: ['Budget Planning', 'Cost Analysis', 'Excel', 'Financial Reporting', 'Data Analysis'],
            education: [{ degree: 'B.A. Economics', institution: 'UCLA', year: 2023 }]
        },
        {
            firstName: 'Thomas', lastName: 'Lee', email: 'thomas.lee@email.com', phone: '(555) 304-4004',
            location: 'Boston, MA', currentPosition: 'Finance Director', yearsOfExperience: 12,
            specialization: 'Financial Management',
            skills: ['Strategic Planning', 'Team Leadership', 'Financial Analysis', 'M&A', 'Risk Management', 'CPA'],
            education: [{ degree: 'MBA Finance', institution: 'MIT Sloan', year: 2012 }]
        }
    ],
    'marketing-communications': [
        {
            firstName: 'Amanda', lastName: 'Garcia', email: 'amanda.garcia@email.com', phone: '(555) 401-5001',
            location: 'Austin, TX', currentPosition: 'Digital Marketing Manager', yearsOfExperience: 5,
            specialization: 'Digital Marketing',
            skills: ['Google Analytics', 'SEO/SEM', 'Social Media', 'Content Marketing', 'Email Marketing', 'Adobe Creative Suite'],
            education: [{ degree: 'B.A. Marketing', institution: 'UT Austin', year: 2019 }]
        },
        {
            firstName: 'Kevin', lastName: 'Taylor', email: 'kevin.taylor@email.com', phone: '(555) 402-5002',
            location: 'San Francisco, CA', currentPosition: 'Content Specialist', yearsOfExperience: 3,
            specialization: 'Content Marketing',
            skills: ['Content Writing', 'SEO', 'WordPress', 'Social Media Management', 'Analytics', 'Copywriting'],
            education: [{ degree: 'B.A. Communications', institution: 'UC Berkeley', year: 2021 }]
        },
        {
            firstName: 'Nicole', lastName: 'White', email: 'nicole.white@email.com', phone: '(555) 403-5003',
            location: 'Miami, FL', currentPosition: 'Marketing Coordinator', yearsOfExperience: 2,
            specialization: 'Brand Management',
            skills: ['Brand Strategy', 'Event Planning', 'Social Media', 'Market Research', 'Project Management'],
            education: [{ degree: 'B.S. Business Administration', institution: 'University of Miami', year: 2022 }]
        },
        {
            firstName: 'Brian', lastName: 'Miller', email: 'brian.miller@email.com', phone: '(555) 404-5004',
            location: 'New York, NY', currentPosition: 'VP of Marketing', yearsOfExperience: 10,
            specialization: 'Marketing Strategy',
            skills: ['Strategic Marketing', 'Team Leadership', 'Brand Management', 'Digital Strategy', 'Budget Management', 'Analytics'],
            education: [{ degree: 'MBA Marketing', institution: 'Columbia Business School', year: 2014 }]
        }
    ],
    'sales-business-development': [
        {
            firstName: 'Christopher', lastName: 'Jones', email: 'christopher.jones@email.com', phone: '(555) 501-6001',
            location: 'Dallas, TX', currentPosition: 'Enterprise Sales Manager', yearsOfExperience: 8,
            specialization: 'Enterprise Sales',
            skills: ['B2B Sales', 'Salesforce', 'Account Management', 'Negotiation', 'CRM', 'Lead Generation'],
            education: [{ degree: 'B.S. Business', institution: 'SMU', year: 2016 }]
        },
        {
            firstName: 'Stephanie', lastName: 'Clark', email: 'stephanie.clark@email.com', phone: '(555) 502-6002',
            location: 'Denver, CO', currentPosition: 'Sales Representative', yearsOfExperience: 4,
            specialization: 'Inside Sales',
            skills: ['Cold Calling', 'Lead Qualification', 'CRM', 'Product Demos', 'Pipeline Management'],
            education: [{ degree: 'B.A. Communications', institution: 'University of Colorado', year: 2020 }]
        },
        {
            firstName: 'Ryan', lastName: 'Moore', email: 'ryan.moore@email.com', phone: '(555) 503-6003',
            location: 'Phoenix, AZ', currentPosition: 'BDR', yearsOfExperience: 1,
            specialization: 'Business Development',
            skills: ['Prospecting', 'Email Marketing', 'Social Selling', 'Lead Generation', 'Sales Tools'],
            education: [{ degree: 'B.S. Marketing', institution: 'Arizona State University', year: 2023 }]
        },
        {
            firstName: 'Michelle', lastName: 'Adams', email: 'michelle.adams@email.com', phone: '(555) 504-6004',
            location: 'Atlanta, GA', currentPosition: 'Sales Director', yearsOfExperience: 12,
            specialization: 'Sales Leadership',
            skills: ['Sales Management', 'Team Leadership', 'Strategic Planning', 'Revenue Growth', 'Customer Success', 'Coaching'],
            education: [{ degree: 'MBA', institution: 'Emory University', year: 2012 }]
        }
    ],
    'administration': [
        {
            firstName: 'Patricia', lastName: 'Turner', email: 'patricia.turner@email.com', phone: '(555) 601-7001',
            location: 'Seattle, WA', currentPosition: 'Executive Assistant', yearsOfExperience: 7,
            specialization: 'Executive Support',
            skills: ['Calendar Management', 'Travel Coordination', 'Microsoft Office', 'Communication', 'Project Coordination'],
            education: [{ degree: 'B.A. Business Administration', institution: 'University of Washington', year: 2017 }]
        },
        {
            firstName: 'James', lastName: 'Phillips', email: 'james.phillips@email.com', phone: '(555) 602-7002',
            location: 'Portland, OR', currentPosition: 'Office Manager', yearsOfExperience: 5,
            specialization: 'Office Management',
            skills: ['Office Operations', 'Vendor Management', 'Team Coordination', 'Budget Management', 'Problem Solving'],
            education: [{ degree: 'B.S. Management', institution: 'Portland State University', year: 2019 }]
        },
        {
            firstName: 'Karen', lastName: 'Evans', email: 'karen.evans@email.com', phone: '(555) 603-7003',
            location: 'Salt Lake City, UT', currentPosition: 'Administrative Assistant', yearsOfExperience: 3,
            specialization: 'Administrative Support',
            skills: ['Data Entry', 'Filing', 'Customer Service', 'Phone Support', 'Document Management'],
            education: [{ degree: 'Associate Degree Business', institution: 'Salt Lake Community College', year: 2021 }]
        },
        {
            firstName: 'Daniel', lastName: 'Roberts', email: 'daniel.roberts@email.com', phone: '(555) 604-7004',
            location: 'Las Vegas, NV', currentPosition: 'Operations Coordinator', yearsOfExperience: 9,
            specialization: 'Operations Support',
            skills: ['Process Improvement', 'Team Leadership', 'Project Management', 'Quality Control', 'Training'],
            education: [{ degree: 'B.S. Operations Management', institution: 'UNLV', year: 2015 }]
        }
    ]
};

// Function to clear existing data
async function clearExistingData() {
    console.log('Clearing existing sample data...');

    // Clear jobs
    const jobsSnapshot = await getDocs(collection(db, 'jobs'));
    for (const doc of jobsSnapshot.docs) {
        await deleteDoc(doc.ref);
    }

    // Clear candidates
    const candidatesSnapshot = await getDocs(collection(db, 'candidates'));
    for (const doc of candidatesSnapshot.docs) {
        await deleteDoc(doc.ref);
    }

    console.log('Existing data cleared.');
}

// Function to create jobs for each category
async function createSampleJobs() {
    console.log('Creating sample jobs...');

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const now = new Date();

    for (const category of JOB_CATEGORIES) {
        const templates = jobTemplates[category.id] || jobTemplates['information-technology']; // Fallback

        for (let i = 0; i < 3; i++) {
            const template = templates[i % templates.length];

            // Random creation date throughout the year
            const createdAt = getRandomDateInRange(startOfYear, now);

            // Expiration date 3-6 months from now
            const expirationDate = new Date();
            expirationDate.setMonth(expirationDate.getMonth() + 3 + Math.floor(Math.random() * 4));

            // Random location
            const locations = ['Remote', 'New York, NY', 'San Francisco, CA', 'Seattle, WA', 'Austin, TX', 'Chicago, IL', 'Boston, MA', 'Los Angeles, CA'];
            const location = locations[Math.floor(Math.random() * locations.length)];

            const jobData = {
                ...template,
                title: `${template.title} ${i + 1}`,
                location,
                category: category.id,
                subcategory: category.subcategories ? category.subcategories[Math.floor(Math.random() * category.subcategories.length)] : undefined,
                status: Math.random() > 0.2 ? 'published' : 'draft', // 80% published
                createdAt,
                updatedAt: createdAt,
                metadata: {
                    expirationDate,
                    industry: category.name,
                    field: category.subcategories ? category.subcategories[0] : category.name
                },
                createdBy: 'admin'
            };

            await addDoc(collection(db, 'jobs'), jobData);
        }
    }

    console.log(`Created ${JOB_CATEGORIES.length * 3} sample jobs.`);
}

// Function to create candidates for each profession
async function createSampleCandidates() {
    console.log('Creating sample candidates...');

    for (const category of JOB_CATEGORIES) {
        const templates = candidateTemplates[category.id] || candidateTemplates['information-technology']; // Fallback

        for (let i = 0; i < 4; i++) {
            const template = templates[i % templates.length];

            const candidateData = {
                ...template,
                firstName: `${template.firstName}${i + 1}`,
                email: template.email.replace('@email.com', `${i + 1}@email.com`),
                profession: category.id,
                specialization: category.subcategories ? category.subcategories[Math.floor(Math.random() * category.subcategories.length)] : undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: `sample-user-${category.id}-${i + 1}`
            };

            await addDoc(collection(db, 'candidates'), candidateData);
        }
    }

    console.log(`Created ${JOB_CATEGORIES.length * 4} sample candidates.`);
}

// Main function to populate all sample data
async function populateSampleData() {
    try {
        console.log('Starting sample data population...');

        await clearExistingData();
        await createSampleJobs();
        await createSampleCandidates();

        console.log('Sample data population completed successfully!');
    } catch (error) {
        console.error('Error populating sample data:', error);
    }
}

// Run the script
populateSampleData(); 