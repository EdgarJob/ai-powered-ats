-- Fix candidates and jobs relationships

-- 1. Create a job if none exists
DO $$
DECLARE
  job_count INTEGER;
  job_id UUID;
  org_id UUID;
BEGIN
  -- Get the organization ID
  SELECT id INTO org_id FROM public.organizations LIMIT 1;
  
  -- Check if we have any jobs
  SELECT COUNT(*) INTO job_count FROM public.jobs;
  
  IF job_count = 0 THEN
    -- Create a sample job
    INSERT INTO public.jobs (
      id,
      org_id,
      title,
      description,
      requirements,
      status,
      created_by
    ) VALUES (
      gen_random_uuid(),
      org_id,
      'Software Developer',
      'We are looking for a talented Software Developer to join our team.',
      ARRAY['JavaScript', 'React', 'Node.js'],
      'published',
      (SELECT id FROM auth.users WHERE email = 'admin@example.com')
    )
    RETURNING id INTO job_id;
    
    RAISE NOTICE 'Created a new job with ID: %', job_id;
  ELSE
    -- Get the first job ID
    SELECT id INTO job_id FROM public.jobs LIMIT 1;
    RAISE NOTICE 'Using existing job with ID: %', job_id;
  END IF;
END $$;

-- 2. Ensure all candidates have job applications
DO $$
DECLARE
  cand RECORD;
  job_id UUID;
BEGIN
  -- Get the job ID
  SELECT id INTO job_id FROM public.jobs LIMIT 1;
  
  -- Loop through all candidates that don't have applications
  FOR cand IN
    SELECT c.id, c.email 
    FROM public.candidates c
    LEFT JOIN public.job_applications ja ON ja.candidate_id = c.id
    WHERE ja.id IS NULL
  LOOP
    -- Create a job application for this candidate
    INSERT INTO public.job_applications (
      candidate_id,
      job_id,
      status,
      created_at,
      updated_at
    ) VALUES (
      cand.id,
      job_id,
      'pending',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Created job application for candidate: %', cand.email;
  END LOOP;
END $$;

-- 3. Verify relationships
DO $$
DECLARE
  candidate_count INTEGER;
  application_count INTEGER;
  unlinked_count INTEGER;
BEGIN
  -- Count all candidates
  SELECT COUNT(*) INTO candidate_count FROM public.candidates;
  
  -- Count all job applications
  SELECT COUNT(*) INTO application_count FROM public.job_applications;
  
  -- Count candidates without applications
  SELECT COUNT(*) INTO unlinked_count 
  FROM public.candidates c
  LEFT JOIN public.job_applications ja ON ja.candidate_id = c.id
  WHERE ja.id IS NULL;
  
  RAISE NOTICE 'Total candidates: %', candidate_count;
  RAISE NOTICE 'Total job applications: %', application_count;
  RAISE NOTICE 'Candidates without applications: %', unlinked_count;
END $$;

-- Display confirmation message
SELECT 'Job application relationships fixed.' AS result; 