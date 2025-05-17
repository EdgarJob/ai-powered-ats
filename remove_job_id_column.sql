-- Migration to remove the job_id column from candidates table
-- This aligns with the new design where the relationship between candidates and jobs
-- is managed through the job_applications table

-- First, drop the policy that depends on job_id column
DROP POLICY IF EXISTS "Users can view their organization's candidates" ON candidates;

-- Create a new policy that uses the job_applications table instead
CREATE POLICY "Users can view their organization's candidates" ON candidates
FOR SELECT USING (
    id IN (
        SELECT ja.candidate_id FROM job_applications ja
        JOIN jobs j ON ja.job_id = j.id
        WHERE j.org_id IN (
            SELECT u.org_id FROM users u
            WHERE u.id = auth.uid()
        )
    )
);

-- Drop any foreign key constraints if they exist
ALTER TABLE candidates 
DROP CONSTRAINT IF EXISTS candidates_job_id_fkey;

-- Remove the job_id column from candidates table
ALTER TABLE candidates 
DROP COLUMN IF EXISTS job_id CASCADE;

-- Make sure Row Level Security policies are updated if needed
-- (Policies that relied on job_id should be modified or removed) 