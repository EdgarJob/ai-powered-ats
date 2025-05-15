-- Insert a sample organization
INSERT INTO organizations (id, name, created_at, updated_at)
VALUES 
    ('d9d53a82-7ae9-4c0f-8f49-6f4a74d6ca97', 'TechCorp Inc.', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add credits for the organization
INSERT INTO org_credits (org_id, credits)
VALUES 
    ('d9d53a82-7ae9-4c0f-8f49-6f4a74d6ca97', 100);

-- Insert sample jobs
INSERT INTO jobs (id, org_id, title, description, requirements, status, created_by, created_at, updated_at)
VALUES
    (
        'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
        'd9d53a82-7ae9-4c0f-8f49-6f4a74d6ca97',
        'Senior Full Stack Developer',
        'We are looking for an experienced Full Stack Developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.',
        ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', '5+ years experience'],
        'published',
        'e9d53a82-7ae9-4c0f-8f49-6f4a74d6ca98',
        NOW(),
        NOW()
    ),
    (
        'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca90',
        'd9d53a82-7ae9-4c0f-8f49-6f4a74d6ca97',
        'Machine Learning Engineer',
        'Join our AI team to develop cutting-edge machine learning solutions. You will work on implementing and deploying ML models in production.',
        ARRAY['Python', 'TensorFlow', 'PyTorch', 'MLOps', '3+ years experience'],
        'published',
        'e9d53a82-7ae9-4c0f-8f49-6f4a74d6ca98',
        NOW(),
        NOW()
    ),
    (
        'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca91',
        'd9d53a82-7ae9-4c0f-8f49-6f4a74d6ca97',
        'UI/UX Designer',
        'Looking for a creative UI/UX Designer to help create beautiful and intuitive user interfaces for our products.',
        ARRAY['Figma', 'Adobe XD', 'User Research', 'Prototyping', '2+ years experience'],
        'draft',
        'e9d53a82-7ae9-4c0f-8f49-6f4a74d6ca98',
        NOW(),
        NOW()
    );

-- Insert sample candidates
INSERT INTO candidates (id, job_id, full_name, email, phone, resume_url, status)
VALUES 
  ('aad53a82-7ae9-4c0f-8f49-6f4a74d6ca91', 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
   'John Smith',
   'john.smith@example.com',
   '+1-555-123-4567',
   'https://storage.example.com/resumes/john-smith.pdf',
   'pending'),
  ('aad53a82-7ae9-4c0f-8f49-6f4a74d6ca92', 'f9d53a82-7ae9-4c0f-8f49-6f4a74d6ca99',
   'Jane Doe',
   'jane.doe@example.com',
   '+1-555-987-6543',
   'https://storage.example.com/resumes/jane-doe.pdf',
   'pending');

-- Insert sample candidate scores
INSERT INTO candidate_scores (candidate_id, total_score, skills_score, experience_score, education_score, explanation)
VALUES 
  ('aad53a82-7ae9-4c0f-8f49-6f4a74d6ca91', 0.85, 0.90, 0.85, 0.80,
   '{"highlights": ["Strong Python background", "5 years ML experience", "Published research papers"],
     "concerns": ["No FastAPI experience"]}'::jsonb),
  ('aad53a82-7ae9-4c0f-8f49-6f4a74d6ca92', 0.78, 0.75, 0.85, 0.75,
   '{"highlights": ["Recent ML projects", "Good academic background"],
     "concerns": ["Less commercial experience"]}'::jsonb); 