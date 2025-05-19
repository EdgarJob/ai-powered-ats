-- Add metadata column to jobs table if it doesn't exist
DO $$
BEGIN
    -- Check if the metadata column already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'metadata'
    ) THEN
        -- Add the metadata column
        ALTER TABLE jobs ADD COLUMN metadata JSONB;
        RAISE NOTICE 'Added metadata column to jobs table';
    ELSE
        RAISE NOTICE 'metadata column already exists in jobs table';
    END IF;

    -- Add job_metadata_schema type if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_type 
        WHERE typname = 'job_metadata_schema'
    ) THEN
        -- Create job_metadata_schema type
        CREATE TYPE job_metadata_schema AS (
            industry TEXT,
            location TEXT,
            field TEXT,
            deadline TEXT
        );
        RAISE NOTICE 'Created job_metadata_schema type';
    ELSE
        RAISE NOTICE 'job_metadata_schema type already exists';
    END IF;

    -- Create function to initialize job metadata
    CREATE OR REPLACE FUNCTION initialize_job_metadata()
    RETURNS VOID AS $$
    DECLARE
        job_record RECORD;
    BEGIN
        FOR job_record IN SELECT id, title FROM jobs WHERE metadata IS NULL OR metadata = '{}'::JSONB LOOP
            -- Create default metadata based on job title
            UPDATE jobs
            SET metadata = jsonb_build_object(
                'industry', 
                    CASE 
                        WHEN job_record.title ILIKE '%software%' OR job_record.title ILIKE '%developer%' OR job_record.title ILIKE '%engineer%' THEN 'Technology'
                        WHEN job_record.title ILIKE '%data%' THEN 'Data Analytics'
                        WHEN job_record.title ILIKE '%design%' THEN 'Design'
                        WHEN job_record.title ILIKE '%product%' THEN 'Product Management'
                        ELSE 'Technology'
                    END,
                'location', 'Remote',
                'field', 
                    CASE 
                        WHEN job_record.title ILIKE '%software%' OR job_record.title ILIKE '%developer%' THEN 'Software Development'
                        WHEN job_record.title ILIKE '%data%' THEN 'Data Science'
                        WHEN job_record.title ILIKE '%design%' THEN 'UI/UX Design'
                        WHEN job_record.title ILIKE '%product%' THEN 'Product Management'
                        ELSE 'General'
                    END,
                'deadline', (CURRENT_DATE + INTERVAL '30 days')::TEXT
            )
            WHERE id = job_record.id;
            
            RAISE NOTICE 'Initialized metadata for job %: %', job_record.id, job_record.title;
        END LOOP;
    END;
    $$ LANGUAGE plpgsql;

    -- Execute the function
    PERFORM initialize_job_metadata();
    RAISE NOTICE 'Initialized metadata for all jobs missing metadata';

END $$; 