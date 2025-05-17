-- Sample data for IT professionals with different experience levels
-- This uses UUIDs compatible with the existing sample_data.sql

-- First ensure we reference existing job IDs from sample_data.sql:
-- f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99 - Senior Full Stack Developer
-- f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca90 - Machine Learning Engineer
-- f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca91 - UI/UX Designer

-- Insert 10 diverse IT professional candidates
INSERT INTO candidates (
  id, 
  job_id, 
  email, 
  phone, 
  resume_url, 
  status,
  first_name,
  last_name,
  bio,
  gender,
  location,
  date_of_birth,
  profile_picture_url,
  education_level,
  certifications,
  employment_history,
  current_salary,
  salary_currency
)
VALUES
-- Entry-level Software Developer (0-2 years)
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca01',
  'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
  'alex.johnson@example.com',
  '+1-555-101-1010',
  'https://example.com/resumes/alex_johnson.pdf',
  'pending',
  'Alex',
  'Johnson',
  'Recent computer science graduate eager to apply my knowledge of modern web development technologies in a professional setting.',
  'Male',
  'Boston, MA',
  '1998-05-15',
  'https://randomuser.me/api/portraits/men/22.jpg',
  'Bachelor''s Degree',
  '[
    {"name": "AWS Cloud Practitioner", "issuer": "Amazon", "date": "2022-11-10"},
    {"name": "React Development Certification", "issuer": "Meta", "date": "2023-02-20"}
  ]'::jsonb,
  '[
    {"title": "Junior Developer Intern", "company": "TechStart Inc", "start_date": "2022-06-01", "end_date": "2023-01-15", "description": "Assisted in front-end development using React and TypeScript"}
  ]'::jsonb,
  65000,
  'USD'
),

-- Mid-level Full Stack Developer (3-5 years)
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca02',
  'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
  'samantha.chen@example.com',
  '+1-555-202-2020',
  'https://example.com/resumes/samantha_chen.pdf',
  'pending',
  'Samantha',
  'Chen',
  'Full stack developer with 4 years of experience building scalable web applications using modern JavaScript frameworks and Node.js.',
  'Female',
  'Seattle, WA',
  '1994-08-22',
  'https://randomuser.me/api/portraits/women/33.jpg',
  'Master''s Degree',
  '[
    {"name": "MongoDB Developer", "issuer": "MongoDB University", "date": "2021-03-15"},
    {"name": "Professional Scrum Developer", "issuer": "Scrum.org", "date": "2022-05-10"}
  ]'::jsonb,
  '[
    {"title": "Full Stack Developer", "company": "WebSolutions LLC", "start_date": "2020-02-10", "end_date": "2023-06-30", "description": "Developed and maintained React/Node.js applications with MongoDB database integration"},
    {"title": "Junior Web Developer", "company": "Creative Digital", "start_date": "2018-09-15", "end_date": "2020-01-20", "description": "Built responsive websites using JavaScript, HTML5, and CSS3"}
  ]'::jsonb,
  110000,
  'USD'
),

-- Senior Backend Developer (6-9 years)
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca03',
  'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
  'michael.rodriguez@example.com',
  '+1-555-303-3030',
  'https://example.com/resumes/michael_rodriguez.pdf',
  'pending',
  'Michael',
  'Rodriguez',
  'Seasoned backend developer with expertise in designing and implementing high-performance microservices and distributed systems.',
  'Male',
  'Austin, TX',
  '1990-11-12',
  'https://randomuser.me/api/portraits/men/45.jpg',
  'Bachelor''s Degree',
  '[
    {"name": "Kubernetes Administrator (CKA)", "issuer": "Cloud Native Computing Foundation", "date": "2022-01-20"},
    {"name": "AWS Solutions Architect Professional", "issuer": "Amazon", "date": "2021-07-15"}
  ]'::jsonb,
  '[
    {"title": "Senior Backend Developer", "company": "TechInnovate", "start_date": "2019-04-10", "end_date": "2023-09-01", "description": "Led development of scalable microservices using Go and Kubernetes"},
    {"title": "Software Engineer", "company": "Enterprise Solutions", "start_date": "2016-08-22", "end_date": "2019-03-15", "description": "Built and maintained Java Spring applications with PostgreSQL databases"},
    {"title": "Junior Developer", "company": "DataSystems Inc", "start_date": "2014-06-01", "end_date": "2016-07-30", "description": "Developed backend services using Python and Django"}
  ]'::jsonb,
  145000,
  'USD'
),

-- Mid-level Machine Learning Engineer (3-5 years)
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca04',
  'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca90',
  'priya.patel@example.com',
  '+1-555-404-4040',
  'https://example.com/resumes/priya_patel.pdf',
  'pending',
  'Priya',
  'Patel',
  'Machine learning engineer focused on NLP applications with experience in deploying models to production environments.',
  'Female',
  'San Francisco, CA',
  '1993-02-28',
  'https://randomuser.me/api/portraits/women/56.jpg',
  'Master''s Degree',
  '[
    {"name": "TensorFlow Developer Certificate", "issuer": "Google", "date": "2021-09-15"},
    {"name": "Applied Data Science with Python", "issuer": "Coursera", "date": "2020-05-22"}
  ]'::jsonb,
  '[
    {"title": "Machine Learning Engineer", "company": "AI Innovations", "start_date": "2021-01-15", "end_date": "2023-08-30", "description": "Designed and implemented NLP models for customer service automation"},
    {"title": "Data Scientist", "company": "Data Analytics Corp", "start_date": "2019-03-10", "end_date": "2020-12-20", "description": "Analyzed large datasets and built predictive models using Python and TensorFlow"}
  ]'::jsonb,
  125000,
  'USD'
),

-- Senior Data Scientist (7+ years)
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca05',
  'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca90',
  'david.goldstein@example.com',
  '+1-555-505-5050',
  'https://example.com/resumes/david_goldstein.pdf',
  'pending',
  'David',
  'Goldstein',
  'Senior data scientist with Ph.D. in Mathematics and extensive experience leading data science teams working on computer vision and deep learning projects.',
  'Male',
  'New York, NY',
  '1986-07-19',
  'https://randomuser.me/api/portraits/men/67.jpg',
  'Ph.D.',
  '[
    {"name": "Deep Learning Specialization", "issuer": "deeplearning.ai", "date": "2018-12-10"},
    {"name": "Microsoft Certified: Azure Data Scientist Associate", "issuer": "Microsoft", "date": "2020-08-15"}
  ]'::jsonb,
  '[
    {"title": "Lead Data Scientist", "company": "Tech Innovations Inc", "start_date": "2020-03-01", "end_date": null, "description": "Lead a team of data scientists working on computer vision models for autonomous systems"},
    {"title": "Senior Data Scientist", "company": "AI Solutions", "start_date": "2016-05-15", "end_date": "2020-02-28", "description": "Developed deep learning models for image recognition and classification"},
    {"title": "Data Scientist", "company": "Research Analytics", "start_date": "2014-09-10", "end_date": "2016-04-30", "description": "Conducted statistical analysis and built machine learning models"}
  ]'::jsonb,
  175000,
  'USD'
),

-- Entry-level UI/UX Designer (1-2 years)
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca06',
  'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca91',
  'jordan.lee@example.com',
  '+1-555-606-6060',
  'https://example.com/resumes/jordan_lee.pdf',
  'pending',
  'Jordan',
  'Lee',
  'Creative UI/UX designer with a strong foundation in user-centered design principles and experience with Figma and Adobe XD.',
  'Non-binary',
  'Portland, OR',
  '1997-09-30',
  'https://randomuser.me/api/portraits/lego/6.jpg',
  'Bachelor''s Degree',
  '[
    {"name": "UI/UX Design Certification", "issuer": "Interaction Design Foundation", "date": "2022-06-15"}
  ]'::jsonb,
  '[
    {"title": "Junior UI Designer", "company": "Creative Solutions", "start_date": "2022-01-10", "end_date": "2023-07-15", "description": "Designed user interfaces for mobile and web applications using Figma"},
    {"title": "Design Intern", "company": "Web Creations", "start_date": "2021-06-01", "end_date": "2021-12-15", "description": "Assisted in creating wireframes and prototypes for client websites"}
  ]'::jsonb,
  70000,
  'USD'
),

-- Mid-level DevOps Engineer (4-6 years)
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca07',
  'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
  'hassan.ahmed@example.com',
  '+1-555-707-7070',
  'https://example.com/resumes/hassan_ahmed.pdf',
  'pending',
  'Hassan',
  'Ahmed',
  'DevOps engineer specializing in CI/CD pipelines, infrastructure as code, and cloud-native technologies.',
  'Male',
  'Chicago, IL',
  '1991-04-12',
  'https://randomuser.me/api/portraits/men/79.jpg',
  'Bachelor''s Degree',
  '[
    {"name": "AWS DevOps Engineer Professional", "issuer": "Amazon", "date": "2021-11-23"},
    {"name": "Certified Kubernetes Administrator", "issuer": "CNCF", "date": "2020-08-17"},
    {"name": "Terraform Associate", "issuer": "HashiCorp", "date": "2022-01-05"}
  ]'::jsonb,
  '[
    {"title": "DevOps Engineer", "company": "Cloud Innovations", "start_date": "2020-05-01", "end_date": "2023-09-15", "description": "Implemented and maintained CI/CD pipelines using GitLab CI and Kubernetes"},
    {"title": "Systems Administrator", "company": "Tech Services Inc", "start_date": "2017-08-10", "end_date": "2020-04-30", "description": "Managed Linux servers and automated deployment processes"}
  ]'::jsonb,
  130000,
  'USD'
),

-- Senior UX Researcher (8+ years)
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca08',
  'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca91',
  'emma.wilson@example.com',
  '+1-555-808-8080',
  'https://example.com/resumes/emma_wilson.pdf',
  'pending',
  'Emma',
  'Wilson',
  'Senior UX researcher with expertise in user testing, interviews, and translating research insights into actionable design recommendations.',
  'Female',
  'Denver, CO',
  '1984-12-05',
  'https://randomuser.me/api/portraits/women/89.jpg',
  'Master''s Degree',
  '[
    {"name": "Nielsen Norman Group UX Certification", "issuer": "NN/g", "date": "2018-03-22"},
    {"name": "Google UX Design Professional Certificate", "issuer": "Google", "date": "2019-06-10"}
  ]'::jsonb,
  '[
    {"title": "Senior UX Researcher", "company": "UserFirst Design", "start_date": "2019-02-15", "end_date": "2023-08-01", "description": "Led research initiatives for enterprise products using quantitative and qualitative methodologies"},
    {"title": "UX Researcher", "company": "Digital Experiences", "start_date": "2015-06-10", "end_date": "2019-01-31", "description": "Conducted user interviews, usability testing, and created personas for various clients"},
    {"title": "Product Analyst", "company": "Tech Products Inc", "start_date": "2012-09-01", "end_date": "2015-05-30", "description": "Analyzed user behavior data and provided recommendations for product improvements"}
  ]'::jsonb,
  155000,
  'USD'
),

-- Mid-level Cybersecurity Analyst (3-5 years)
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca09',
  'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
  'marcus.johnson@example.com',
  '+1-555-909-9090',
  'https://example.com/resumes/marcus_johnson.pdf',
  'pending',
  'Marcus',
  'Johnson',
  'Cybersecurity professional with experience in threat detection, incident response, and implementing security best practices.',
  'Male',
  'Atlanta, GA',
  '1992-08-17',
  'https://randomuser.me/api/portraits/men/91.jpg',
  'Bachelor''s Degree',
  '[
    {"name": "Certified Information Systems Security Professional (CISSP)", "issuer": "ISC²", "date": "2022-02-15"},
    {"name": "Certified Ethical Hacker (CEH)", "issuer": "EC-Council", "date": "2020-11-30"}
  ]'::jsonb,
  '[
    {"title": "Cybersecurity Analyst", "company": "SecureDefense Inc", "start_date": "2021-04-01", "end_date": "2023-09-15", "description": "Monitored network traffic, investigated security incidents, and implemented security controls"},
    {"title": "IT Security Specialist", "company": "Data Protection Services", "start_date": "2019-06-15", "end_date": "2021-03-30", "description": "Conducted vulnerability assessments and helped implement security policies"}
  ]'::jsonb,
  115000,
  'USD'
),

-- Lead Frontend Engineer (10+ years)
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca10',
  'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
  'sofia.garcia@example.com',
  '+1-555-010-1010',
  'https://example.com/resumes/sofia_garcia.pdf',
  'pending',
  'Sofia',
  'Garcia',
  'Experienced frontend architect with a passion for creating accessible, performant, and beautiful web applications.',
  'Female',
  'Los Angeles, CA',
  '1983-03-25',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'Master''s Degree',
  '[
    {"name": "Frontend Masters JavaScript Performance", "issuer": "Frontend Masters", "date": "2021-07-12"},
    {"name": "Web Accessibility Certification", "issuer": "International Association of Accessibility Professionals", "date": "2020-09-18"}
  ]'::jsonb,
  '[
    {"title": "Lead Frontend Engineer", "company": "WebTech Innovations", "start_date": "2018-07-01", "end_date": "2023-08-30", "description": "Led frontend architecture decisions and mentored junior developers on React best practices"},
    {"title": "Senior Frontend Developer", "company": "Digital Experiences Co", "start_date": "2014-03-15", "end_date": "2018-06-30", "description": "Developed complex single-page applications using Angular and later React"},
    {"title": "Web Developer", "company": "Creative Solutions", "start_date": "2010-09-10", "end_date": "2014-02-28", "description": "Built responsive websites and implemented JavaScript functionality"},
    {"title": "Junior Developer", "company": "WebStart", "start_date": "2008-06-15", "end_date": "2010-08-31", "description": "Created HTML/CSS layouts and simple JavaScript interactions"}
  ]'::jsonb,
  185000,
  'USD'
);

-- Insert candidate scores for each professional
INSERT INTO candidate_scores (
  candidate_id, 
  total_score, 
  skills_score, 
  experience_score, 
  education_score, 
  explanation
)
VALUES
-- Entry-level Software Developer
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca01',
  0.65,
  0.60,
  0.55,
  0.80,
  '{
    "highlights": ["Recent CS degree with good foundation", "Some React experience", "Cloud certification"],
    "concerns": ["Limited professional experience", "No TypeScript experience", "No Node.js backend experience"] 
  }'::jsonb
),

-- Mid-level Full Stack Developer
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca02',
  0.85,
  0.90,
  0.80,
  0.85,
  '{
    "highlights": ["Solid React/Node experience", "MongoDB certified", "4 years relevant experience"],
    "concerns": ["No TypeScript mentioned", "Limited enterprise-scale experience"]
  }'::jsonb
),

-- Senior Backend Developer
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca03',
  0.78,
  0.85,
  0.95,
  0.70,
  '{
    "highlights": ["Microservices architecture expertise", "Strong backend skills", "Cloud certifications"],
    "concerns": ["Limited frontend experience", "Primarily Go experience, not Node.js"]
  }'::jsonb
),

-- Mid-level Machine Learning Engineer
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca04',
  0.92,
  0.95,
  0.90,
  0.90,
  '{
    "highlights": ["Strong NLP experience", "TensorFlow certified", "ML model deployment experience"],
    "concerns": ["Less experience with computer vision", "No PyTorch mentioned"]
  }'::jsonb
),

-- Senior Data Scientist
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca05',
  0.96,
  0.98,
  0.95,
  0.95,
  '{
    "highlights": ["PhD in Mathematics", "Deep learning specialist", "Computer vision expertise", "Team leadership"],
    "concerns": ["May be overqualified", "No MLOps experience mentioned"]
  }'::jsonb
),

-- Entry-level UI/UX Designer
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca06',
  0.78,
  0.75,
  0.65,
  0.80,
  '{
    "highlights": ["Figma proficiency", "Strong foundation in design principles", "Creative portfolio"],
    "concerns": ["Limited professional experience", "No user research experience"]
  }'::jsonb
),

-- Mid-level DevOps Engineer
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca07',
  0.60,
  0.70,
  0.75,
  0.65,
  '{
    "highlights": ["Strong cloud certifications", "CI/CD pipeline experience", "Kubernetes expertise"],
    "concerns": ["Not primarily a developer role", "Limited frontend or backend development experience"]
  }'::jsonb
),

-- Senior UX Researcher
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca08',
  0.70,
  0.65,
  0.85,
  0.80,
  '{
    "highlights": ["Extensive user research experience", "UX certifications", "Leadership experience"],
    "concerns": ["Not primarily a designer role", "Limited UI design experience", "Not focused on technical implementation"]
  }'::jsonb
),

-- Mid-level Cybersecurity Analyst
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca09',
  0.55,
  0.60,
  0.65,
  0.70,
  '{
    "highlights": ["Security certifications", "Threat detection experience"],
    "concerns": ["Not a development role", "Limited coding experience", "Different career path from position requirements"]
  }'::jsonb
),

-- Lead Frontend Engineer
(
  '11153a82-7ae9-4c0f-8f49-6f4a74d6ca10',
  0.90,
  0.95,
  0.98,
  0.85,
  '{
    "highlights": ["Extensive React experience", "Frontend architecture expertise", "Performance optimization skills", "Accessibility knowledge"],
    "concerns": ["May have less backend experience", "Might be overqualified for mid-level positions"]
  }'::jsonb
); 