-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insert a new admin user
-- REPLACE 'your-secure-password' WITH YOUR ACTUAL PASSWORD BEFORE RUNNING!
INSERT INTO users (email, "passwordHash", name, role)
VALUES (
  'admin@mindfirehomes.com',
  crypt('@Titan2006', gen_salt('bf')),
  'Admin User',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Verification
SELECT id, email, role, "createdAt" FROM users WHERE email = 'admin@mindfirehomes.com';
