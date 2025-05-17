-- Check the jobs table structure first
\d jobs;

-- View the jobs with their metadata
SELECT id, title, metadata FROM jobs;

-- Show parsed metadata fields for debugging
SELECT 
    id, 
    title,
    metadata,
    CASE 
        WHEN metadata IS NULL THEN NULL
        WHEN jsonb_typeof(metadata::jsonb) = 'object' THEN metadata->>'industry'
        ELSE NULL
    END AS parsed_industry,
    CASE 
        WHEN metadata IS NULL THEN NULL
        WHEN jsonb_typeof(metadata::jsonb) = 'object' THEN metadata->>'location'
        ELSE NULL
    END AS parsed_location,
    CASE 
        WHEN metadata IS NULL THEN NULL
        WHEN jsonb_typeof(metadata::jsonb) = 'object' THEN metadata->>'field'
        ELSE NULL
    END AS parsed_field,
    CASE 
        WHEN metadata IS NULL THEN NULL
        WHEN jsonb_typeof(metadata::jsonb) = 'object' THEN metadata->>'deadline'
        ELSE NULL
    END AS parsed_deadline
FROM jobs
ORDER BY created_at DESC; 