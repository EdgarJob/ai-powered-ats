-- Revert the previous fix by setting job_id back to NULL for candidates that were created through registration
-- This restores the original design where candidate profiles don't need a job_id initially

UPDATE candidates
SET job_id = NULL
WHERE email IN ('eddykerario@gmail.com', 'msuyagifft@gmail.com'); 