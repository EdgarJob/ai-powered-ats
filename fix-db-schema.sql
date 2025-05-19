-- Fix database schema issues that are causing login problems

-- 1. Make sure types are correctly defined
DO $$
BEGIN
  -- Check if user_role type exists, create it if not
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'member');
    RAISE NOTICE 'Created user_role enum type';
  ELSE
    -- Check if the type includes the 'member' value, add it if not
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'user_role' AND e.enumlabel = 'member'
    ) THEN
      ALTER TYPE user_role ADD VALUE 'member';
      RAISE NOTICE 'Added member value to user_role enum';
    END IF;
  END IF;

  -- Check if job_status type exists
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    CREATE TYPE job_status AS ENUM ('draft', 'published', 'closed');
    RAISE NOTICE 'Created job_status enum type';
  END IF;

  -- Check if candidate_status type exists
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'candidate_status') THEN
    CREATE TYPE candidate_status AS ENUM ('pending', 'reviewed', 'shortlisted', 'rejected');
    RAISE NOTICE 'Created candidate_status enum type';
  END IF;
END $$;

-- 2. Reset the admin user completely
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if admin exists
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@example.com';
  
  -- Delete admin if exists
  IF admin_user_id IS NOT NULL THEN
    -- Delete from users table first (due to foreign key)
    DELETE FROM public.users WHERE id = admin_user_id;
    -- Then delete from auth.users
    DELETE FROM auth.users WHERE id = admin_user_id;
    RAISE NOTICE 'Deleted existing admin user';
  END IF;

  -- Create a fresh admin user
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
    'admin@example.com',
    NOW(),
    crypt('admin123', gen_salt('bf')),
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
  )
  RETURNING id INTO admin_user_id;
  
  RAISE NOTICE 'Created new admin user with ID: %', admin_user_id;

  -- Make sure organization exists
  INSERT INTO public.organizations (id, name)
  VALUES ('00000000-0000-0000-0000-000000000000', 'Default Organization')
  ON CONFLICT (id) DO NOTHING;
  
  -- Add to users table with admin role
  INSERT INTO public.users (id, org_id, role)
  VALUES (
    admin_user_id,
    '00000000-0000-0000-0000-000000000000',
    'admin'
  );
  
  RAISE NOTICE 'Added admin user to public.users table';
END $$;

-- 3. Refresh database functions
DO $$
BEGIN
  -- Create the execute_sql function if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'execute_sql' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
    RAISE NOTICE 'Created execute_sql function';
  END IF;

  -- Create check_column_exists function if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'check_column_exists' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    CREATE OR REPLACE FUNCTION public.check_column_exists(table_name text, column_name text)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      exists_bool boolean;
    BEGIN
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = $1
        AND column_name = $2
      ) INTO exists_bool;
      RETURN exists_bool;
    END;
    $$;
    RAISE NOTICE 'Created check_column_exists function';
  END IF;
END $$;

-- Verify that users table has the correct schema
DO $$
BEGIN
  -- Make sure the users table has the correct columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.users ADD COLUMN role user_role NOT NULL DEFAULT 'member';
    RAISE NOTICE 'Added role column to users table';
  END IF;
  
  -- Make sure the users table references auth.users
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_id_fkey'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT users_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint to users table';
  END IF;
END $$;

-- Display completion message
SELECT 'Database schema fixed. Try logging in with admin@example.com / admin123' AS result; 