-- Create a candidate entry for our test user
DO $$
DECLARE
  test_user_id UUID;
  test_user_email TEXT;
  candidate_id UUID;
BEGIN
  -- Get the latest test user we created
  SELECT id, email INTO test_user_id, test_user_email
  FROM auth.users 
  WHERE email LIKE 'test_%@example.com'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'No test user found. Please create a test user first.';
  END IF;
  
  RAISE NOTICE 'Found test user ID: %, Email: %', test_user_id, test_user_email;
  
  -- Generate a new UUID for the candidate
  candidate_id := gen_random_uuid();
  
  -- Insert into candidates table
  INSERT INTO public.candidates (
    id,
    email,
    phone,
    resume_url,
    status,
    first_name,
    last_name,
    bio,
    location,
    created_at,
    updated_at
  ) VALUES (
    candidate_id,
    test_user_email,
    '+1234567890',
    'https://example.com/resume.pdf',
    'pending',
    'Test',
    'User',
    'This is a test user created for development purposes',
    'Test Location',
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Created candidate with ID: %', candidate_id;
  RAISE NOTICE 'Test user can now log in with:';
  RAISE NOTICE 'Email: %', test_user_email;
  RAISE NOTICE 'Password: password123';
END $$; 