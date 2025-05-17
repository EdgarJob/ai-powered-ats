-- Fix resume URLs in candidate_resumes table
-- The current URLs are either invalid or placeholder links that don't work

-- Update resume URLs to point to valid sample files
UPDATE candidate_resumes
SET file_url = CASE
    -- Use publicly available sample resumes based on candidate's field
    WHEN version_name LIKE '%Software%' OR version_name LIKE '%Developer%' 
        THEN 'https://www.resume-now.com/wp-content/uploads/2023/05/software-engineer-resume-example.pdf'
    WHEN version_name LIKE '%Data%' OR version_name LIKE '%Analyst%'
        THEN 'https://www.resume-now.com/wp-content/uploads/2023/04/data-analyst-resume-example.pdf'
    WHEN version_name LIKE '%Manager%' OR version_name LIKE '%Business%'
        THEN 'https://www.resume-now.com/wp-content/uploads/2023/04/project-manager-resume-example.pdf'
    WHEN version_name LIKE '%Design%' OR version_name LIKE '%UI%' OR version_name LIKE '%UX%'
        THEN 'https://www.resume-now.com/wp-content/uploads/2023/02/graphic-designer-resume-example.pdf'
    ELSE 'https://www.resume-now.com/wp-content/uploads/2023/01/professional-resume-example.pdf'
END
WHERE file_url LIKE 'https://example.com%' 
   OR file_url LIKE 'http://127.0.0.1%';

-- If we need to update the original resume_url in candidates table
UPDATE candidates c
SET resume_url = (
    SELECT cr.file_url 
    FROM candidate_resumes cr 
    WHERE cr.candidate_id = c.id AND cr.is_default = true
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1 
    FROM candidate_resumes cr 
    WHERE cr.candidate_id = c.id AND cr.is_default = true
); 