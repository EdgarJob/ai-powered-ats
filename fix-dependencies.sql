-- Script to manually fix database dependencies before starting Supabase

-- Drop tables that might be causing dependency issues in reverse order
DO $$
BEGIN
    -- Check if the job_applications table exists and drop it
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_applications') THEN
        DROP TABLE IF EXISTS job_applications;
        RAISE NOTICE 'Dropped job_applications table';
    END IF;

    -- Check if the candidate_resumes table exists and drop it
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'candidate_resumes') THEN
        DROP TABLE IF EXISTS candidate_resumes;
        RAISE NOTICE 'Dropped candidate_resumes table';
    END IF;

    -- Drop other tables in the correct order
    DROP TABLE IF EXISTS candidate_scores;
    DROP TABLE IF EXISTS candidates;
    DROP TABLE IF EXISTS jobs;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS org_credits;
    DROP TABLE IF EXISTS organizations;
    
    -- Clean up remaining dependencies
    -- Check and remove constraints that point to organizations table
    FOR r IN (
        SELECT tc.constraint_name, tc.table_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'organizations'
    ) LOOP
        EXECUTE 'ALTER TABLE ' || r.table_name || ' DROP CONSTRAINT ' || r.constraint_name;
        RAISE NOTICE 'Dropped constraint % on table %', r.constraint_name, r.table_name;
    END LOOP;

    RAISE NOTICE 'All dependent tables and constraints have been dropped';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
END
$$; 