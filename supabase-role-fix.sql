-- Fix for role-based access issues in existing accounts

-- 1. Check the current profiles table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- 2. Show a sample of existing user profiles to understand the current state
SELECT id, email, role, department_id FROM profiles LIMIT 10;

-- 3. Set default role for any profile where role is NULL or empty
UPDATE profiles 
SET role = 'user'
WHERE role IS NULL OR role = '';

-- 4. Add missing role column if needed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
    END IF;
END $$;

-- 5. Map users with specific department_id to appropriate roles
-- This helps existing users that have department_id set but no role
UPDATE profiles
SET role = 'ceo'
FROM departments
WHERE profiles.department_id = departments.id 
  AND departments.department_code = 'CEO'
  AND (profiles.role IS NULL OR profiles.role = 'user');

UPDATE profiles
SET role = 'secretary' 
FROM departments
WHERE profiles.department_id = departments.id 
  AND departments.department_code = 'SEC'
  AND (profiles.role IS NULL OR profiles.role = 'user');

UPDATE profiles
SET role = 'finance'
FROM departments
WHERE profiles.department_id = departments.id 
  AND departments.department_code = 'FIN'
  AND (profiles.role IS NULL OR profiles.role = 'user');

UPDATE profiles
SET role = 'business_management'
FROM departments
WHERE profiles.department_id = departments.id 
  AND departments.department_code = 'BM'
  AND (profiles.role IS NULL OR profiles.role = 'user');

UPDATE profiles
SET role = 'auditor'
FROM departments
WHERE profiles.department_id = departments.id 
  AND departments.department_code = 'AUD'
  AND (profiles.role IS NULL OR profiles.role = 'user');

UPDATE profiles
SET role = 'welfare'
FROM departments
WHERE profiles.department_id = departments.id 
  AND departments.department_code = 'WEL'
  AND (profiles.role IS NULL OR profiles.role = 'user');

UPDATE profiles
SET role = 'board_member'
FROM departments
WHERE profiles.department_id = departments.id 
  AND departments.department_code = 'BMEM'
  AND (profiles.role IS NULL OR profiles.role = 'user');

-- 6. Fix RLS policies to ensure profiles can be read
DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;
CREATE POLICY "Users can read all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users can read their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- 7. Fix profile update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- 8. Show the updated profiles after changes
SELECT id, email, role, department_id FROM profiles LIMIT 10; 