// Job Categories and Professions
export interface JobCategory {
    id: string;
    name: string;
    description: string;
    subcategories?: string[];
}

export const JOB_CATEGORIES: JobCategory[] = [
    {
        id: 'information-technology',
        name: 'Information Technology',
        description: 'Software development, IT support, cybersecurity, and tech roles',
        subcategories: [
            'Software Development',
            'Web Development',
            'Mobile Development',
            'Data Science',
            'Machine Learning/AI',
            'Cybersecurity',
            'DevOps',
            'Cloud Computing',
            'Database Administration',
            'IT Support',
            'Network Administration',
            'Quality Assurance',
            'UI/UX Design',
            'Product Management',
            'Technical Writing'
        ]
    },
    {
        id: 'human-resources',
        name: 'Human Resources',
        description: 'HR management, recruitment, training, and employee relations',
        subcategories: [
            'HR Management',
            'Recruitment',
            'Training & Development',
            'Employee Relations',
            'Compensation & Benefits',
            'HR Analytics',
            'Organizational Development',
            'Performance Management',
            'HR Compliance',
            'Talent Acquisition'
        ]
    },
    {
        id: 'administration',
        name: 'Administration',
        description: 'Administrative support, office management, and clerical work',
        subcategories: [
            'Executive Assistant',
            'Administrative Assistant',
            'Office Manager',
            'Data Entry',
            'Reception',
            'Document Management',
            'Scheduling',
            'Customer Service',
            'General Administration',
            'Virtual Assistant'
        ]
    },
    {
        id: 'audit-compliance',
        name: 'Audit & Compliance',
        description: 'Internal audit, external audit, compliance, and risk management',
        subcategories: [
            'Internal Audit',
            'External Audit',
            'Compliance Officer',
            'Risk Management',
            'Financial Audit',
            'IT Audit',
            'Operational Audit',
            'Regulatory Compliance',
            'Quality Assurance',
            'Fraud Investigation'
        ]
    },
    {
        id: 'monitoring-evaluation',
        name: 'Monitoring & Evaluation',
        description: 'M&E, research, data analysis, and program evaluation',
        subcategories: [
            'M&E Officer',
            'Research Analyst',
            'Data Analyst',
            'Program Evaluation',
            'Impact Assessment',
            'Survey Design',
            'Statistical Analysis',
            'Report Writing',
            'Database Management',
            'Field Monitoring'
        ]
    },
    {
        id: 'finance-accounting',
        name: 'Finance & Accounting',
        description: 'Financial management, accounting, budgeting, and analysis',
        subcategories: [
            'Accountant',
            'Financial Analyst',
            'Budget Analyst',
            'Tax Specialist',
            'Bookkeeper',
            'Financial Controller',
            'Treasury Management',
            'Investment Analysis',
            'Cost Accounting',
            'Financial Planning'
        ]
    },
    {
        id: 'marketing-communications',
        name: 'Marketing & Communications',
        description: 'Marketing, PR, communications, and brand management',
        subcategories: [
            'Digital Marketing',
            'Content Marketing',
            'Social Media Management',
            'Public Relations',
            'Brand Management',
            'Communications',
            'Graphic Design',
            'Marketing Analytics',
            'Event Management',
            'Copywriting'
        ]
    },
    {
        id: 'sales-business-development',
        name: 'Sales & Business Development',
        description: 'Sales, business development, and customer relations',
        subcategories: [
            'Sales Representative',
            'Business Development',
            'Account Management',
            'Sales Manager',
            'Customer Success',
            'Lead Generation',
            'Partnership Development',
            'Territory Management',
            'Inside Sales',
            'Field Sales'
        ]
    },
    {
        id: 'operations-logistics',
        name: 'Operations & Logistics',
        description: 'Operations management, supply chain, and logistics',
        subcategories: [
            'Operations Manager',
            'Supply Chain Management',
            'Logistics Coordinator',
            'Warehouse Management',
            'Process Improvement',
            'Quality Control',
            'Inventory Management',
            'Production Planning',
            'Procurement',
            'Vendor Management'
        ]
    },
    {
        id: 'healthcare-medical',
        name: 'Healthcare & Medical',
        description: 'Medical professionals, healthcare administration, and support',
        subcategories: [
            'Physician',
            'Nurse',
            'Medical Assistant',
            'Healthcare Administration',
            'Medical Records',
            'Pharmacy',
            'Laboratory Technician',
            'Radiology',
            'Physical Therapy',
            'Mental Health'
        ]
    },
    {
        id: 'education-training',
        name: 'Education & Training',
        description: 'Teaching, training, curriculum development, and education administration',
        subcategories: [
            'Teacher',
            'Professor',
            'Training Specialist',
            'Curriculum Developer',
            'Education Administrator',
            'Academic Advisor',
            'Instructional Designer',
            'Educational Technology',
            'Student Services',
            'Research'
        ]
    },
    {
        id: 'legal-regulatory',
        name: 'Legal & Regulatory',
        description: 'Legal services, regulatory affairs, and compliance',
        subcategories: [
            'Lawyer',
            'Legal Assistant',
            'Paralegal',
            'Regulatory Affairs',
            'Contract Management',
            'Intellectual Property',
            'Corporate Law',
            'Litigation',
            'Legal Research',
            'Compliance'
        ]
    },
    {
        id: 'engineering-technical',
        name: 'Engineering & Technical',
        description: 'Engineering disciplines and technical specialties',
        subcategories: [
            'Software Engineer',
            'Mechanical Engineer',
            'Electrical Engineer',
            'Civil Engineer',
            'Chemical Engineer',
            'Industrial Engineer',
            'Environmental Engineer',
            'Technical Specialist',
            'Research & Development',
            'Project Engineer'
        ]
    },
    {
        id: 'consulting-advisory',
        name: 'Consulting & Advisory',
        description: 'Management consulting, advisory services, and strategic planning',
        subcategories: [
            'Management Consultant',
            'Strategy Consultant',
            'Business Analyst',
            'Process Consultant',
            'Technology Consultant',
            'Financial Advisor',
            'Change Management',
            'Project Management',
            'Strategic Planning',
            'Organizational Development'
        ]
    },
    {
        id: 'creative-design',
        name: 'Creative & Design',
        description: 'Creative roles, design, media, and content creation',
        subcategories: [
            'Graphic Designer',
            'Web Designer',
            'UI/UX Designer',
            'Content Creator',
            'Video Production',
            'Photography',
            'Creative Director',
            'Art Director',
            'Copywriter',
            'Brand Designer'
        ]
    },
    {
        id: 'other',
        name: 'Other',
        description: 'Roles that don\'t fit into the above categories',
        subcategories: [
            'General Labor',
            'Security',
            'Maintenance',
            'Transportation',
            'Hospitality',
            'Retail',
            'Food Service',
            'Real Estate',
            'Insurance',
            'Non-Profit'
        ]
    }
];

// Helper functions
export function getCategoryById(id: string): JobCategory | undefined {
    return JOB_CATEGORIES.find(category => category.id === id);
}

export function getCategoryByName(name: string): JobCategory | undefined {
    return JOB_CATEGORIES.find(category =>
        category.name.toLowerCase() === name.toLowerCase()
    );
}

export function getAllSubcategories(): string[] {
    return JOB_CATEGORIES.flatMap(category => category.subcategories || []);
}

export function getSubcategoriesByCategory(categoryId: string): string[] {
    const category = getCategoryById(categoryId);
    return category?.subcategories || [];
}

// Date range options for filtering
export interface DateRange {
    id: string;
    label: string;
    days?: number;
    startDate?: Date;
    endDate?: Date;
}

export const DATE_RANGES: DateRange[] = [
    { id: 'all', label: 'All Time' },
    { id: 'last-week', label: 'Last Week', days: 7 },
    { id: 'last-30-days', label: 'Last 30 Days', days: 30 },
    { id: 'last-90-days', label: 'Last 90 Days', days: 90 },
    { id: 'last-6-months', label: 'Last 6 Months', days: 180 },
    { id: 'last-year', label: 'Last Year', days: 365 },
    { id: 'custom', label: 'Custom Range' }
];

export function getDateRangeFilter(rangeId: string, customStart?: Date, customEnd?: Date): { startDate?: Date; endDate?: Date } {
    if (rangeId === 'all') {
        return {};
    }

    if (rangeId === 'custom') {
        return {
            startDate: customStart,
            endDate: customEnd
        };
    }

    const range = DATE_RANGES.find(r => r.id === rangeId);
    if (range?.days) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - range.days);

        return { startDate, endDate };
    }

    return {};
} 