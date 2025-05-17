-- Create a job_applications table to track applications
-- This allows candidates to apply for multiple jobs while maintaining a single profile

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    cover_letter TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Add a unique constraint to prevent multiple applications from the same candidate to the same job
    UNIQUE(candidate_id, job_id)
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS job_applications_candidate_id_idx ON job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS job_applications_job_id_idx ON job_applications(job_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON job_applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Candidates can view their own applications"
    ON job_applications FOR SELECT
    USING (candidate_id IN (
        SELECT c.id FROM candidates c
        WHERE c.email = auth.email()
    ));
    
CREATE POLICY "Organization members can view job applications"
    ON job_applications FOR SELECT
    USING (job_id IN (
        SELECT j.id FROM jobs j
        WHERE j.org_id IN (
            SELECT u.org_id FROM users u
            WHERE u.id = auth.uid()
        )
    ));

-- Add sample data for testing (optional - can be uncommented if needed)
-- This would create applications for existing candidates to existing jobs

/*
INSERT INTO job_applications (candidate_id, job_id, status)
VALUES 
    -- Candidates from our previous insert
    ('11153a82-7ae9-4c0f-8f49-6f4a74d6ca01', 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99', 'pending'),
    ('11153a82-7ae9-4c0f-8f49-6f4a74d6ca02', 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99', 'reviewed'),
    ('11153a82-7ae9-4c0f-8f49-6f4a74d6ca03', 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99', 'shortlisted'),
    ('11153a82-7ae9-4c0f-8f49-6f4a74d6ca04', 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca90', 'pending'),
    ('11153a82-7ae9-4c0f-8f49-6f4a74d6ca05', 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca90', 'shortlisted');
*/ 