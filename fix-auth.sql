-- Fix authentication issues in the Supabase database

-- 1. Make sure we have an organization
INSERT INTO public.organizations (id, name, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000000', 'Default Organization', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Reset and create the admin user
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if admin user exists in auth.users
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@example.com';
  
  -- If admin exists, delete it to reset
  IF admin_user_id IS NOT NULL THEN
    -- First delete from public.users
    DELETE FROM public.users WHERE id = admin_user_id;
    -- Then delete from auth.users
    DELETE FROM auth.users WHERE id = admin_user_id;
    RAISE NOTICE 'Deleted existing admin user';
  END IF;
  
  -- Create the admin user in auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    email_confirmed_at,
    encrypted_password,
    aud,
    role,
    created_at,
    updated_at,
    confirmation_token,
    email_change_token_new,
    recovery_token
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@example.com',
    NOW(),
    crypt('admin123', gen_salt('bf')),
    'authenticated',
    'authenticated',
    NOW(),
    NOW(),
    '',
    '',
    ''
  )
  RETURNING id INTO admin_user_id;
  
  RAISE NOTICE 'Created admin user with ID %', admin_user_id;
  
  -- Insert admin into public.users with admin role
  INSERT INTO public.users (id, org_id, role, created_at, updated_at)
  VALUES (
    admin_user_id,
    '00000000-0000-0000-0000-000000000000',
    'admin',
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Added admin user to public.users table';
END $$;

-- 3. Create test candidate users
DO $$
DECLARE
  user_id UUID;
  org_id UUID := '00000000-0000-0000-0000-000000000000';
  job_id UUID;
BEGIN
  -- Make sure we have at least one job for candidates to apply to
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
      org_id,
      'Software Developer',
      'Develop software applications',
      ARRAY['JavaScript', 'React', 'Node.js'],
      'published',
      (SELECT id FROM auth.users WHERE email = 'admin@example.com')
    )
    RETURNING id INTO job_id;
    
    RAISE NOTICE 'Created placeholder job with ID %', job_id;
  END IF;
  
  -- Loop to create 5 test candidates
  FOR i IN 1..5 LOOP
    -- Create auth user
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      email_confirmed_at,
      encrypted_password,
      aud,
      role,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'candidate' || i || '@example.com',
      NOW(),
      crypt('password123', gen_salt('bf')),
      'authenticated',
      'authenticated',
      NOW(),
      NOW()
    )
    RETURNING id INTO user_id;
    
    -- Insert into public.users with member role
    INSERT INTO public.users (id, org_id, role, created_at, updated_at)
    VALUES (
      user_id,
      org_id,
      'member',
      NOW(),
      NOW()
    );
    
    -- Insert into candidates table
    INSERT INTO public.candidates (
      id,
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
      user_id,
      job_id,
      'Candidate ' || i,
      'candidate' || i || '@example.com',
      '+1234567890' || i,
      'https://example.com/resume' || i || '.pdf',
      'pending',
      'Candidate',
      'Number ' || i,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Created candidate % with ID %', i, user_id;
  END LOOP;
END $$;

-- 4. Fix enum type issue for role field
DO $$
BEGIN
  -- Check if we need to add 'member' value to user_role enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid 
    WHERE t.typname = 'user_role' AND e.enumlabel = 'member'
  ) THEN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'member';
    RAISE NOTICE 'Added member value to user_role enum';
  END IF;
END $$;

-- 5. Fix any incorrect role values
UPDATE public.users
SET role = 'member'
WHERE role = 'user';

RAISE NOTICE 'Updated user roles from "user" to "member"';

-- 6. Force reset all user passwords to password123
DO $$
DECLARE
  usr RECORD;
BEGIN
  FOR usr IN 
    SELECT id, email FROM auth.users 
    WHERE email != 'admin@example.com'
  LOOP
    UPDATE auth.users
    SET encrypted_password = crypt('password123', gen_salt('bf'))
    WHERE id = usr.id;
    
    RAISE NOTICE 'Reset password for user %', usr.email;
  END LOOP;
END $$;

-- Display confirmation message
SELECT 'Authentication fixes complete.' AS result;
SELECT 'You can now log in with:' AS note;
SELECT 'Admin: admin@example.com / admin123' AS admin_credentials;
SELECT 'Users: candidate1@example.com through candidate5@example.com with password123' AS user_credentials; 