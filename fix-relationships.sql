-- Fix relationships between users and candidates tables

-- 1. First, check if we need to add a user_id column to candidates
DO $$
BEGIN
  -- Check if user_id column already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'candidates'
    AND column_name = 'user_id'
  ) THEN
    -- Add the user_id column if it doesn't exist
    ALTER TABLE public.candidates 
    ADD COLUMN user_id UUID REFERENCES auth.users(id);
    
    RAISE NOTICE 'Added user_id column to candidates table';
  ELSE
    RAISE NOTICE 'user_id column already exists in candidates table';
  END IF;
END $$;

-- 2. Fix candidates that should be linked to users based on email
UPDATE public.candidates c
SET user_id = u.id
FROM auth.users u
WHERE c.email = u.email
AND c.user_id IS NULL;

RAISE NOTICE 'Updated user_id for candidates based on matching emails';

-- 3. Check for candidates that are not linked to any user
DO $$
DECLARE
  unlinked_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unlinked_count 
  FROM public.candidates 
  WHERE user_id IS NULL;
  
  RAISE NOTICE 'Number of candidates not linked to any user: %', unlinked_count;
END $$;

-- 4. Add missing job_id values if needed
UPDATE public.candidates
SET job_id = (SELECT id FROM public.jobs LIMIT 1)
WHERE job_id = 'no-job' OR job_id IS NULL;

RAISE NOTICE 'Fixed missing job_id values in candidates table';

-- 5. Check if there are any users without corresponding candidates
DO $$
DECLARE
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM public.users u
  LEFT JOIN public.candidates c ON u.id = c.user_id
  WHERE u.role = 'member' AND c.id IS NULL;
  
  RAISE NOTICE 'Number of member users without candidates: %', missing_count;
END $$;

-- 6. Create candidates for users that don't have one
DO $$
DECLARE
  usr RECORD;
  job_id UUID;
BEGIN
  -- Get a job ID to use
  SELECT id INTO job_id FROM public.jobs LIMIT 1;
  
  IF job_id IS NULL THEN
    -- Create a placeholder job if none exists
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
      (SELECT id FROM public.organizations LIMIT 1),
      'Default Job',
      'Default job description',
      ARRAY['Default'],
      'published',
      (SELECT id FROM auth.users WHERE email = 'admin@example.com')
    )
    RETURNING id INTO job_id;
  END IF;
  
  -- Find users without candidates
  FOR usr IN
    SELECT u.id, u.email
    FROM public.users u
    LEFT JOIN public.candidates c ON u.id = c.user_id
    WHERE u.role = 'member' AND c.id IS NULL
  LOOP
    -- Create a candidate for this user
    INSERT INTO public.candidates (
      id,
      user_id,
      job_id,
      full_name,
      email,
      phone,
      resume_url,
      status,
      first_name,
      last_name,
      created_at,
      updated_at
    ) VALUES (
      usr.id,
      usr.id,
      job_id,
      COALESCE(
        (SELECT CONCAT(first_name, ' ', last_name) FROM public.candidates WHERE email = usr.email LIMIT 1),
        CONCAT('User ', SUBSTRING(usr.id::text, 1, 8))
      ),
      usr.email,
      NULL,
      'https://example.com/resume.pdf',
      'pending',
      COALESCE(
        (SELECT first_name FROM public.candidates WHERE email = usr.email LIMIT 1),
        'User'
      ),
      COALESCE(
        (SELECT last_name FROM public.candidates WHERE email = usr.email LIMIT 1),
        SUBSTRING(usr.id::text, 1, 8)
      ),
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Created candidate for user ID: %', usr.id;
  END LOOP;
END $$;

-- Display confirmation message
SELECT 'Relationship fixes complete.' AS result; 