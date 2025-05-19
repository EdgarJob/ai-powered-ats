-- Completely recreate the admin user by removing and readding it
-- First, store any existing admin ID to maintain references
DO $$
DECLARE
  admin_user_id UUID;
  default_org_id UUID;
BEGIN
  -- Get the admin user ID before deleting
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@example.com';
  
  -- Delete admin user from auth.users (will cascade to public.users)
  DELETE FROM auth.users WHERE email = 'admin@example.com';
  
  -- Create a new admin user ID if one didn't exist
  IF admin_user_id IS NULL THEN
    admin_user_id := gen_random_uuid();
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

  -- Insert new admin user with known password
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
    updated_at
  ) VALUES (
    admin_user_id,
    'admin@example.com',
    -- This is a bcrypt hash for 'admin123'
    '$2a$10$SuiV.qjvYIgZSMubZzIWUucYpg.7vqbxkFVRkSKXV7qzrB8GqOuk2',
    NOW(),
    'authenticated',
    'authenticated',
    '{"provider": "email", "providers": ["email"]}',
    '{"email_verified": true}',
    NOW(),
    NOW()
  );
  
  -- Insert the admin user into public.users
  INSERT INTO public.users (id, org_id, role, created_at, updated_at)
  VALUES (admin_user_id, default_org_id, 'admin', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE 
  SET role = 'admin', updated_at = NOW();
  
  RAISE NOTICE 'Admin user recreated with ID: %', admin_user_id;
  RAISE NOTICE 'Email: admin@example.com';
  RAISE NOTICE 'Password: admin123';
END $$; 