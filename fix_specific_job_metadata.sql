-- First, identify the specific job
SELECT id, title, metadata FROM jobs WHERE title = 'UI/UX Designer';

-- Then update the job with explicitly formatted metadata
UPDATE jobs
SET metadata = jsonb_build_object(
    'industry', 'Design',
    'location', 'Arusha',
    'field', 'UI/UX Design',
    'deadline', '2025-06-30'
)
WHERE title = 'UI/UX Designer';

-- Verify the update
SELECT id, title, metadata, 
       metadata->>'industry' as industry,
       metadata->>'location' as location,
       metadata->>'field' as field,
       metadata->>'deadline' as deadline
FROM jobs 
WHERE title = 'UI/UX Designer'; 