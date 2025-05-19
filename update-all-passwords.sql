-- Update all user passwords to a known value (password123)
-- This is useful for testing and development purposes

-- The encrypted_password is a BCrypt hash of 'password123'
UPDATE auth.users 
SET 
  encrypted_password = '$2a$10$ioY.h0wbsJ3bWmqQBxIX8.W1nkdHpS7vEVM9DJYyGRqJ4DFpSaKiG', 
  updated_at = NOW()
WHERE email != 'admin@example.com';

-- Set admin user password separately (admin123)
UPDATE auth.users 
SET 
  encrypted_password = '$2a$10$SuiV.qjvYIgZSMubZzIWUucYpg.7vqbxkFVRkSKXV7qzrB8GqOuk2', 
  updated_at = NOW()
WHERE email = 'admin@example.com';

-- Output summary of changes
SELECT 'Passwords updated for all ' || COUNT(*) || ' users.' as result FROM auth.users; 