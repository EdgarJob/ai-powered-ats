-- SQL script to create or update the admin user in Supabase

-- First, insert into auth.users if it doesn't exist already
DO $$
DECLARE
  admin_user_id UUID;
  default_org_id UUID;
BEGIN
  -- Get or create admin user ID
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@example.com';
  
  IF admin_user_id IS NULL THEN
    -- Generate a new UUID for the user
    admin_user_id := gen_random_uuid();
    
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      role,
      aud,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmed_at
    ) VALUES (
      admin_user_id,
      'admin@example.com',
      -- This is a hashed password for 'admin123'
      '$2a$10$K.vvN7hdLMYR1F4BC28TBuvGa1PWfD4E8a5/3uy4oqc4D/feU/1fC',
      NOW(),
      'authenticated',
      'authenticated',
      '{"provider": "email", "providers": ["email"]}',
      '{"email_verified": true}',
      NOW(),
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Created new admin user with ID: %', admin_user_id;
  ELSE
    -- Update password for existing user
    UPDATE auth.users
    SET 
      encrypted_password = '$2a$10$K.vvN7hdLMYR1F4BC28TBuvGa1PWfD4E8a5/3uy4oqc4D/feU/1fC', 
      updated_at = NOW()
    WHERE id = admin_user_id;
    
    RAISE NOTICE 'Updated existing admin user with ID: %', admin_user_id;
  END IF;
  
  -- Get default organization
  SELECT id INTO default_org_id FROM public.organizations LIMIT 1;
  
  IF default_org_id IS NULL THEN
    -- Create a default organization if none exists
    default_org_id := gen_random_uuid();
    
    INSERT INTO public.organizations (id, name, created_at, updated_at)
    VALUES (default_org_id, 'Default Organization', NOW(), NOW());
    
    RAISE NOTICE 'Created default organization with ID: %', default_org_id;
  END IF;
  
  -- Check if admin user exists in public.users
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = admin_user_id) THEN
    -- Insert into public.users with admin role
    INSERT INTO public.users (id, org_id, role, created_at, updated_at)
    VALUES (admin_user_id, default_org_id, 'admin', NOW(), NOW());
    
    RAISE NOTICE 'Added admin user to public.users table';
  ELSE
    -- Update role to admin
    UPDATE public.users
    SET role = 'admin', updated_at = NOW()
    WHERE id = admin_user_id;
    
    RAISE NOTICE 'Updated admin role in public.users table';
  END IF;
  
  RAISE NOTICE 'Admin user setup complete';
  RAISE NOTICE 'Email: admin@example.com';
  RAISE NOTICE 'Password: admin123';
END $$; 