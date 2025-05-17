-- Fix job metadata with a simple direct approach
-- This ensures each job has industry, location and field values

-- First, let's reset all metadata to ensure clean state
UPDATE jobs
SET metadata = '{}'::jsonb;

-- Now set the proper metadata for each job
UPDATE jobs
SET metadata = jsonb_build_object(
    'industry', CASE
        WHEN title LIKE '%Software%' OR title LIKE '%Developer%' OR title LIKE '%Programmer%' THEN 'Information Technology'
        WHEN title LIKE '%Data%' OR title LIKE '%Machine Learning%' OR title LIKE '%Analyst%' THEN 'Data Science'
        WHEN title LIKE '%Manager%' OR title LIKE '%Lead%' THEN 'Management'
        WHEN title LIKE '%Design%' OR title LIKE '%UI%' OR title LIKE '%UX%' THEN 'Design'
        WHEN title LIKE '%Marketing%' THEN 'Marketing'
        WHEN title LIKE '%Finance%' OR title LIKE '%Accountant%' THEN 'Finance'
        ELSE 'Technology'
    END,
    'location', CASE
        WHEN id::text = 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca90' THEN 'Dar es Salaam'
        WHEN id::text = 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca91' THEN 'Arusha'
        WHEN id::text = 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca92' THEN 'Zanzibar' 
        WHEN id::text = 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca93' THEN 'Dodoma'
        WHEN id::text = 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99' THEN 'Remote'
        WHEN title LIKE '%Strategy%' THEN 'Dar es Salaam'
        WHEN title LIKE '%Senior Manager%' THEN 'Dar es Salaam'
        ELSE 'Dar es Salaam'
    END,
    'field', CASE
        WHEN title LIKE '%Software%' OR title LIKE '%Developer%' OR title LIKE '%Programmer%' THEN 'Software Development'
        WHEN title LIKE '%Machine Learning%' OR title LIKE '%Data%' OR title LIKE '%Analyst%' THEN 'Data Science'
        WHEN title LIKE '%Manager%' THEN 'Project Management'
        WHEN title LIKE '%Design%' OR title LIKE '%UI%' OR title LIKE '%UX%' THEN 'UI/UX Design'
        WHEN title LIKE '%Marketing%' THEN 'Digital Marketing'
        WHEN title LIKE '%Finance%' OR title LIKE '%Accountant%' THEN 'Accounting'
        ELSE 'Software Engineering'
    END,
    'deadline', CASE
        WHEN id::text = 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99' THEN '2025-05-31'
        WHEN id::text = 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca90' THEN '2025-06-15'
        WHEN id::text = 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca91' THEN '2025-06-30'
        WHEN title LIKE '%Strategy%' THEN '2025-05-31'
        WHEN title LIKE '%Senior Manager%' THEN '2025-07-31'
        ELSE '2025-06-30'
    END
);

-- Verify the changes
SELECT id, title, 
       metadata->>'industry' as industry, 
       metadata->>'location' as location, 
       metadata->>'field' as field,
       metadata->>'deadline' as deadline
FROM jobs; 