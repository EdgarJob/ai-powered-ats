-- Add metadata column to jobs table if it doesn't exist
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Update jobs that have NULL metadata with a default value
UPDATE jobs 
SET metadata = jsonb_build_object(
    'industry', 
    CASE 
        WHEN title ILIKE '%software%' OR title ILIKE '%developer%' OR title ILIKE '%engineer%' THEN 'Technology'
        WHEN title ILIKE '%data%' THEN 'Data Analytics'
        WHEN title ILIKE '%design%' THEN 'Design'
        WHEN title ILIKE '%product%' THEN 'Product Management'
        ELSE 'Technology'
    END,
    'location', 'Remote',
    'field', 
    CASE 
        WHEN title ILIKE '%software%' OR title ILIKE '%developer%' THEN 'Software Development'
        WHEN title ILIKE '%data%' THEN 'Data Science'
        WHEN title ILIKE '%design%' THEN 'UI/UX Design'
        WHEN title ILIKE '%product%' THEN 'Product Management'
        ELSE 'General'
    END,
    'deadline', (CURRENT_DATE + INTERVAL '30 days')::TEXT
)
WHERE metadata IS NULL OR metadata = '{}'::JSONB; 