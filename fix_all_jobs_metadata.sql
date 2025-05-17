-- First, make sure the metadata column is JSONB
ALTER TABLE jobs 
ALTER COLUMN metadata TYPE JSONB USING metadata::jsonb;

-- Fix UI/UX Designer job
UPDATE jobs
SET metadata = jsonb_build_object(
    'industry', 'Design',
    'location', 'Arusha',
    'field', 'UI/UX Design',
    'deadline', '2025-06-30'
)
WHERE title = 'UI/UX Designer';

-- Fix Machine Learning Engineer job
UPDATE jobs
SET metadata = jsonb_build_object(
    'industry', 'Data Science',
    'location', 'Dar es Salaam',
    'field', 'Data Science',
    'deadline', '2025-06-15'
)
WHERE title = 'Machine Learning Engineer';

-- Fix Senior Full Stack Developer job
UPDATE jobs
SET metadata = jsonb_build_object(
    'industry', 'Information Technology',
    'location', 'Remote',
    'field', 'Software Development',
    'deadline', '2025-05-31'
)
WHERE title = 'Senior Full Stack Developer';

-- Fix Senior Manager job
UPDATE jobs
SET metadata = jsonb_build_object(
    'industry', 'Management',
    'location', 'Dar es Salaam',
    'field', 'Project Management',
    'deadline', '2025-07-31'
)
WHERE title = 'Senior Manager';

-- Fix Strategy & Technology Manager job
UPDATE jobs
SET metadata = jsonb_build_object(
    'industry', 'Management',
    'location', 'Dar es Salaam',
    'field', 'Project Management',
    'deadline', '2025-05-31'
)
WHERE title = 'Strategy & Technology Manager';

-- Verify all jobs have proper metadata
SELECT 
    id, 
    title,
    metadata,
    metadata->>'industry' as industry,
    metadata->>'location' as location,
    metadata->>'field' as field,
    metadata->>'deadline' as deadline
FROM jobs
ORDER BY title; 