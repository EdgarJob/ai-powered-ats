-- Update UI/UX Designer job
UPDATE jobs
SET 
  requirements = ARRAY[
    'Proficiency in Figma, Adobe XD, and Sketch',
    'Strong portfolio demonstrating user-centered design approach',
    'Experience with design systems and component libraries',
    'Knowledge of accessibility standards (WCAG)',
    '2+ years of experience in UI/UX design for digital products',
    'Excellent communication and collaboration skills',
    'Understanding of front-end technologies (HTML, CSS, JavaScript)',
    'Ability to conduct user research and usability testing'
  ],
  responsibilities = '• Create user-centered designs by understanding business requirements, user feedback, and UI/UX best practices
• Design UI elements and tools such as navigation menus, search boxes, tabs, and widgets for our digital products
• Develop wireframes and prototypes around customer needs
• Conduct user research and evaluate user feedback
• Identify and troubleshoot UX problems (e.g., responsiveness)
• Collaborate with cross-functional teams throughout the design process
• Create original graphic designs (e.g., images, sketches, and tables)
• Prepare and present rough drafts to internal teams and key stakeholders
• Conduct usability testing to ensure optimal user experiences
• Incorporate accessibility best practices into all designs'
WHERE id = 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca91';

-- Update Senior Full Stack Developer job
UPDATE jobs
SET 
  requirements = ARRAY[
    'React, Node.js, TypeScript, PostgreSQL',
    '5+ years of experience in full-stack development',
    'Strong understanding of web application architecture',
    'Experience with RESTful APIs and GraphQL',
    'Knowledge of CI/CD pipelines',
    'Strong problem-solving skills and attention to detail',
    'Experience with cloud services (AWS, Azure, or GCP)',
    'Understanding of security best practices',
    'Experience with agile development methodologies',
    'Bachelor''s degree in Computer Science or related field (or equivalent experience)'
  ],
  responsibilities = '• Design and implement scalable web applications using React, Node.js, and TypeScript
• Develop and maintain database schemas and queries using PostgreSQL
• Build RESTful APIs and integrate with front-end components
• Collaborate with UI/UX designers to implement responsive and intuitive user interfaces
• Ensure the technical feasibility of UI/UX designs
• Optimize applications for maximum speed and scalability
• Participate in architecture and design discussions
• Implement security and data protection measures
• Write clean, maintainable, and well-documented code
• Debug issues and implement fixes across the stack
• Collaborate with cross-functional teams in an agile environment
• Mentor junior developers and conduct code reviews'
WHERE id = 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99';

-- Update Machine Learning Engineer job
UPDATE jobs
SET 
  requirements = ARRAY[
    'Python, TensorFlow, PyTorch, MLOps',
    '3+ years of experience in machine learning or related field',
    'Strong understanding of machine learning algorithms and architectures',
    'Experience with NLP, computer vision, or recommendation systems',
    'Knowledge of data processing and feature engineering techniques',
    'Experience deploying ML models to production environments',
    'Strong programming skills in Python and related ML libraries',
    'Understanding of software engineering best practices',
    'Experience with cloud-based ML services (AWS SageMaker, Azure ML, etc.)',
    'Master''s or PhD in Computer Science, Mathematics, or related field preferred',
    'Strong communication skills to explain complex concepts to non-technical stakeholders'
  ],
  responsibilities = '• Design, develop, and deploy machine learning models for various applications
• Perform data preprocessing, feature engineering, and exploratory data analysis
• Research and implement state-of-the-art ML algorithms and techniques
• Build data pipelines to handle large-scale datasets
• Deploy and monitor ML models in production environments
• Collaborate with data scientists, engineers, and product managers
• Optimize ML model performance, scalability, and efficiency
• Document model architectures, experiments, and results
• Stay current with the latest ML research and technologies
• Implement A/B testing frameworks to evaluate model performance
• Develop MLOps processes for continuous model improvement
• Present findings and insights to technical and non-technical stakeholders'
WHERE id = 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca90';

-- Update Senior Manager job
UPDATE jobs
SET 
  requirements = ARRAY[
    '7+ years of experience in IT management or enterprise systems',
    'Strong leadership and team management skills',
    'Experience with enterprise software implementation and integration',
    'Knowledge of IT security and compliance requirements',
    'Project management experience (PMP certification preferred)',
    'Experience with IT budgeting and resource planning',
    'Strong problem-solving and analytical skills',
    'Excellent communication and stakeholder management abilities',
    'Bachelor''s degree in Computer Science, Information Systems, or related field',
    'MBA or relevant advanced degree preferred'
  ],
  responsibilities = '• Own and lead all projects within the enterprise applications space including implementation of new systems and upgrades
• Develop and execute strategic plans for enterprise systems optimization
• Manage and mentor a team of IT professionals responsible for enterprise applications
• Ensure all systems comply with internal policies, security standards, and audit requirements
• Collaborate with stakeholders to identify business needs and translate them into technical requirements
• Develop and manage budgets for enterprise systems and related projects
• Establish and monitor KPIs for system performance and team productivity
• Lead vendor management and contract negotiations for enterprise applications
• Create and maintain documentation for all enterprise systems and processes
• Perform regular security and compliance audits
• Drive continuous improvement initiatives for enterprise applications
• Report to executive leadership on system performance, issues, and opportunities'
WHERE id = '8c3517ae-b89a-4145-b0fa-b791ea3319a5';

-- Update Strategy & Technology Manager job
UPDATE jobs
SET 
  requirements = ARRAY[
    '5+ years of technology consulting experience',
    'Strong project management skills',
    'Experience with digital transformation initiatives',
    'Knowledge of technology strategy and roadmap development',
    'Excellent client relationship management skills',
    'Experience with business process optimization',
    'Strong analytical and problem-solving abilities',
    'Excellent presentation and communication skills',
    'Bachelor''s degree in Computer Science, Business, or related field',
    'MBA or relevant advanced degree preferred',
    'Professional certifications such as PMP, ITIL, or Agile/Scrum'
  ],
  responsibilities = '• Develop and implement technology strategies aligned with organizational goals
• Lead cross-functional teams in the delivery of key technology projects
• Conduct technology assessments and provide recommendations for improvement
• Create and present business cases for technology investments
• Manage project timelines, resources, and budgets to ensure successful delivery
• Identify and mitigate project risks and issues
• Collaborate with stakeholders to gather requirements and define project scope
• Develop and maintain relationships with key technology vendors
• Stay current with emerging technologies and industry trends
• Provide strategic guidance to leadership on technology decisions
• Measure and report on the impact of technology initiatives
• Coach and mentor team members to enhance their technical and professional skills'
WHERE id = 'fe26129a-6cca-4a05-b2f0-40d521f31ce3'; 