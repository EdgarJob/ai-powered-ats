-- Implement multiple CV versions for candidates
-- This allows candidates to upload and maintain different versions of their resume/CV
-- and select which one to use for each job application

-- 1. Create a table to store candidate resume versions
CREATE TABLE IF NOT EXISTS candidate_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    version_name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS candidate_resumes_candidate_id_idx ON candidate_resumes(candidate_id);

-- Set up RLS policies
ALTER TABLE candidate_resumes ENABLE ROW LEVEL SECURITY;

-- Policy for candidates to view their own resumes
CREATE POLICY "Candidates can view their own resumes" 
    ON candidate_resumes FOR SELECT 
    USING (candidate_id IN (
        SELECT c.id FROM candidates c
        WHERE c.email = auth.email()
    ));

-- Policy for candidates to manage their own resumes
CREATE POLICY "Candidates can manage their own resumes" 
    ON candidate_resumes FOR ALL 
    USING (candidate_id IN (
        SELECT c.id FROM candidates c
        WHERE c.email = auth.email()
    ));

-- Policy for organization members to view candidate resumes
CREATE POLICY "Organization members can view candidate resumes" 
    ON candidate_resumes FOR SELECT 
    USING (candidate_id IN (
        SELECT ja.candidate_id FROM job_applications ja
        JOIN jobs j ON ja.job_id = j.id
        WHERE j.org_id IN (
            SELECT u.org_id FROM users u
            WHERE u.id = auth.uid()
        )
    ));

-- 2. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_candidate_resumes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_candidate_resumes_updated_at
BEFORE UPDATE ON candidate_resumes
FOR EACH ROW
EXECUTE FUNCTION update_candidate_resumes_updated_at();

-- 3. Modify job_applications table to reference a specific resume version
-- First, rename cover_letter to resume_version_id
ALTER TABLE job_applications
RENAME COLUMN cover_letter TO resume_version_id;

-- Change the column type from TEXT to UUID
ALTER TABLE job_applications
ALTER COLUMN resume_version_id TYPE UUID USING NULL;

-- Add foreign key constraint
ALTER TABLE job_applications
ADD CONSTRAINT job_applications_resume_version_id_fkey
FOREIGN KEY (resume_version_id) REFERENCES candidate_resumes(id) ON DELETE SET NULL;

-- 4. Move existing resume URLs from candidates table to candidate_resumes table
-- (This ensures we don't lose existing data)
INSERT INTO candidate_resumes (candidate_id, file_url, version_name, is_default)
SELECT 
    id, 
    resume_url, 
    'Default Resume', 
    true
FROM candidates
WHERE resume_url IS NOT NULL AND resume_url != '';

-- 5. Update job_applications trigger to enforce that resume_version_id belongs to the correct candidate
CREATE OR REPLACE FUNCTION check_resume_version_owner()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.resume_version_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM candidate_resumes cr
            WHERE cr.id = NEW.resume_version_id
            AND cr.candidate_id = NEW.candidate_id
        ) THEN
            RAISE EXCEPTION 'Resume version must belong to the candidate applying for the job';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_resume_version_owner
BEFORE INSERT OR UPDATE ON job_applications
FOR EACH ROW
EXECUTE FUNCTION check_resume_version_owner(); 