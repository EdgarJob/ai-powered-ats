-- Make sure metadata column is properly formatted as JSONB
-- This script fixes common issues with metadata storage

-- First, view current metadata state
SELECT id, title, metadata, jsonb_typeof(metadata) as metadata_type 
FROM jobs;

-- Make sure metadata is JSONB type
ALTER TABLE jobs
ALTER COLUMN metadata TYPE JSONB USING COALESCE(metadata, '{}'::jsonb);

-- Fix any jobs with NULL metadata
UPDATE jobs 
SET metadata = '{}'::jsonb 
WHERE metadata IS NULL;

-- Ensure all jobs have standardized metadata keys even if values are null
UPDATE jobs
SET metadata = metadata || jsonb_build_object(
    'industry', COALESCE(metadata->>'industry', null),
    'location', COALESCE(metadata->>'location', null),
    'field', COALESCE(metadata->>'field', null),
    'deadline', COALESCE(metadata->>'deadline', null)
);

-- Set explicit values for all jobs to ensure they display properly
-- UI/UX Designer
UPDATE jobs
SET metadata = jsonb_build_object(
    'industry', 'Design',
    'location', 'Arusha',
    'field', 'UI/UX Design',
    'deadline', '2025-06-30'
)
WHERE title = 'UI/UX Designer';

-- Machine Learning Engineer
UPDATE jobs
SET metadata = jsonb_build_object(
    'industry', 'Data Science',
    'location', 'Dar es Salaam',
    'field', 'Machine Learning',
    'deadline', '2025-05-15'
)
WHERE title = 'Machine Learning Engineer';

-- Senior Full Stack Developer
UPDATE jobs
SET metadata = jsonb_build_object(
    'industry', 'Information Technology',
    'location', 'Remote',
    'field', 'Software Development',
    'deadline', '2025-04-30'
)
WHERE title LIKE '%Full Stack%';

-- Strategy & Technology Manager
UPDATE jobs
SET metadata = jsonb_build_object(
    'industry', 'Management',
    'location', 'Dar es Salaam',
    'field', 'Project Management',
    'deadline', '2025-07-15'
)
WHERE title LIKE '%Technology Manager%';

-- Senior Manager
UPDATE jobs
SET metadata = jsonb_build_object(
    'industry', 'Management',
    'location', 'Nairobi',
    'field', 'Business Administration',
    'deadline', '2025-03-31'
)
WHERE title = 'Senior Manager';

-- Add any other specific job titles here

-- Verify updates
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