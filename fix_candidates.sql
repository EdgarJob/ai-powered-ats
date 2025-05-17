-- Get list of candidates with NULL job_id
SELECT id, email FROM candidates WHERE job_id IS NULL;

-- Choose a default job_id to assign to these candidates
-- In this case, we're using the Senior Full Stack Developer job
-- You can change this to any job ID that makes sense for your application

-- Update candidates with NULL job_id
UPDATE candidates
SET job_id = 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99'  -- Senior Full Stack Developer job
WHERE job_id IS NULL; 