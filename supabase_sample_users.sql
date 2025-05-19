-- SQL script to create sample users directly in Supabase
-- Run this in the Supabase SQL Editor

-- First create our organization if it doesn't exist
INSERT INTO public.organizations (id, name, created_at, updated_at)
VALUES ('default-org-id', 'Default Organization', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create admin user in auth.users table
-- NOTE: This is a simplified version. In a real system, proper password hashing would be handled by Supabase Auth
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
  gen_random_uuid(), -- id
  '00000000-0000-0000-0000-000000000000', -- instance_id (default)
  'admin@example.com', -- email
  NOW(), -- email_confirmed_at
  -- This is NOT a real secure password. This is just for the sample SQL script.
  -- In a real application, auth would be handled through Supabase auth APIs
  crypt('admin123', gen_salt('bf')), -- encrypted_password
  'authenticated', -- aud
  'authenticated', -- role
  NOW(), -- created_at
  NOW(), -- updated_at
  '', -- confirmation_token
  '', -- email_change_token_new
  '' -- recovery_token
)
ON CONFLICT (email) DO NOTHING;

-- Get the ID of the admin user to use in the users table
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1;
  
  -- Insert into the users table with admin role
  INSERT INTO public.users (id, org_id, role, created_at, updated_at)
  VALUES (admin_id, 'default-org-id', 'admin', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET role = 'admin';
END
$$;

-- Create sample user: John Doe
DO $$
DECLARE
  user_id UUID;
BEGIN
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
    updated_at,
    confirmation_token,
    email_change_token_new,
    recovery_token
  ) VALUES (
    gen_random_uuid(), -- id
    '00000000-0000-0000-0000-000000000000', -- instance_id
    'john@example.com', -- email
    NOW(), -- email_confirmed_at
    crypt('password123', gen_salt('bf')), -- encrypted_password
    'authenticated', -- aud
    'authenticated', -- role
    NOW(), -- created_at
    NOW(), -- updated_at
    '', -- confirmation_token
    '', -- email_change_token_new
    '' -- recovery_token
  )
  ON CONFLICT (email) DO NOTHING;

  -- Get the generated ID
  SELECT id INTO user_id FROM auth.users WHERE email = 'john@example.com' LIMIT 1;
  
  -- Insert into the users table
  INSERT INTO public.users (id, org_id, role, created_at, updated_at)
  VALUES (user_id, 'default-org-id', 'user', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert into the candidates table
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
  )
  VALUES (
    user_id, 
    'no-job', 
    'John Doe', 
    'john@example.com', 
    NULL, 
    '', 
    'pending', 
    'John', 
    'Doe', 
    NOW(), 
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
END
$$;

-- Create sample user: Jane Smith
DO $$
DECLARE
  user_id UUID;
BEGIN
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
    updated_at,
    confirmation_token,
    email_change_token_new,
    recovery_token
  ) VALUES (
    gen_random_uuid(), -- id
    '00000000-0000-0000-0000-000000000000', -- instance_id
    'jane@example.com', -- email
    NOW(), -- email_confirmed_at
    crypt('password123', gen_salt('bf')), -- encrypted_password
    'authenticated', -- aud
    'authenticated', -- role
    NOW(), -- created_at
    NOW(), -- updated_at
    '', -- confirmation_token
    '', -- email_change_token_new
    '' -- recovery_token
  )
  ON CONFLICT (email) DO NOTHING;

  -- Get the generated ID
  SELECT id INTO user_id FROM auth.users WHERE email = 'jane@example.com' LIMIT 1;
  
  -- Insert into the users table
  INSERT INTO public.users (id, org_id, role, created_at, updated_at)
  VALUES (user_id, 'default-org-id', 'user', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert into the candidates table
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
  )
  VALUES (
    user_id, 
    'no-job', 
    'Jane Smith', 
    'jane@example.com', 
    NULL, 
    '', 
    'pending', 
    'Jane', 
    'Smith', 
    NOW(), 
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
END
$$;

-- Create sample user: Alex Johnson
DO $$
DECLARE
  user_id UUID;
BEGIN
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
    updated_at,
    confirmation_token,
    email_change_token_new,
    recovery_token
  ) VALUES (
    gen_random_uuid(), -- id
    '00000000-0000-0000-0000-000000000000', -- instance_id
    'alex@example.com', -- email
    NOW(), -- email_confirmed_at
    crypt('password123', gen_salt('bf')), -- encrypted_password
    'authenticated', -- aud
    'authenticated', -- role
    NOW(), -- created_at
    NOW(), -- updated_at
    '', -- confirmation_token
    '', -- email_change_token_new
    '' -- recovery_token
  )
  ON CONFLICT (email) DO NOTHING;

  -- Get the generated ID
  SELECT id INTO user_id FROM auth.users WHERE email = 'alex@example.com' LIMIT 1;
  
  -- Insert into the users table
  INSERT INTO public.users (id, org_id, role, created_at, updated_at)
  VALUES (user_id, 'default-org-id', 'user', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert into the candidates table
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
  )
  VALUES (
    user_id, 
    'no-job', 
    'Alex Johnson', 
    'alex@example.com', 
    NULL, 
    '', 
    'pending', 
    'Alex', 
    'Johnson', 
    NOW(), 
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
END
$$;

-- Create sample user: Sarah Johnson
DO $$
DECLARE
  user_id UUID;
BEGIN
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
    updated_at,
    confirmation_token,
    email_change_token_new,
    recovery_token
  ) VALUES (
    gen_random_uuid(), -- id
    '00000000-0000-0000-0000-000000000000', -- instance_id
    'sarah@example.com', -- email
    NOW(), -- email_confirmed_at
    crypt('password123', gen_salt('bf')), -- encrypted_password
    'authenticated', -- aud
    'authenticated', -- role
    NOW(), -- created_at
    NOW(), -- updated_at
    '', -- confirmation_token
    '', -- email_change_token_new
    '' -- recovery_token
  )
  ON CONFLICT (email) DO NOTHING;

  -- Get the generated ID
  SELECT id INTO user_id FROM auth.users WHERE email = 'sarah@example.com' LIMIT 1;
  
  -- Insert into the users table
  INSERT INTO public.users (id, org_id, role, created_at, updated_at)
  VALUES (user_id, 'default-org-id', 'user', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert into the candidates table
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
  )
  VALUES (
    user_id, 
    'no-job', 
    'Sarah Johnson', 
    'sarah@example.com', 
    NULL, 
    '', 
    'pending', 
    'Sarah', 
    'Johnson', 
    NOW(), 
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
END
$$;

-- Create sample user: Michael Wong
DO $$
DECLARE
  user_id UUID;
BEGIN
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
    updated_at,
    confirmation_token,
    email_change_token_new,
    recovery_token
  ) VALUES (
    gen_random_uuid(), -- id
    '00000000-0000-0000-0000-000000000000', -- instance_id
    'michael@example.com', -- email
    NOW(), -- email_confirmed_at
    crypt('password123', gen_salt('bf')), -- encrypted_password
    'authenticated', -- aud
    'authenticated', -- role
    NOW(), -- created_at
    NOW(), -- updated_at
    '', -- confirmation_token
    '', -- email_change_token_new
    '' -- recovery_token
  )
  ON CONFLICT (email) DO NOTHING;

  -- Get the generated ID
  SELECT id INTO user_id FROM auth.users WHERE email = 'michael@example.com' LIMIT 1;
  
  -- Insert into the users table
  INSERT INTO public.users (id, org_id, role, created_at, updated_at)
  VALUES (user_id, 'default-org-id', 'user', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert into the candidates table
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
  )
  VALUES (
    user_id, 
    'no-job', 
    'Michael Wong', 
    'michael@example.com', 
    NULL, 
    '', 
    'pending', 
    'Michael', 
    'Wong', 
    NOW(), 
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
END
$$; 