-- tSa Admin Hub Database Maintenance Script
-- Run this script in the Supabase SQL Editor to ensure proper database configuration

-- 1. Check and fix the profiles table
DO $$ 
BEGIN
    -- Create profiles table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            first_name TEXT,
            last_name TEXT,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            department_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable Row Level Security
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ELSE
        -- Add columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
            ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'department_id') THEN
            ALTER TABLE public.profiles ADD COLUMN department_id UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'created_at') THEN
            ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at') THEN
            ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- 2. Check and fix the departments table
DO $$ 
BEGIN
    -- Create departments table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'departments') THEN
        CREATE TABLE public.departments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            department_code TEXT UNIQUE NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable Row Level Security
        ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
        
        -- Insert default departments
        INSERT INTO public.departments (name, department_code, description) VALUES
            ('Chief Executive Office', 'CEO', 'Executive leadership department'),
            ('Secretariat', 'SEC', 'Administrative and secretarial department'),
            ('Finance Department', 'FIN', 'Financial management department'),
            ('Business Management', 'BM', 'Business operations and management department'),
            ('Audit Department', 'AUD', 'Audit and compliance department'),
            ('Welfare Department', 'WEL', 'Employee welfare and benefits department'),
            ('Board Members', 'BMEM', 'Board of directors department')
        ON CONFLICT (department_code) DO NOTHING;
    END IF;
END $$;

-- 3. Set up the profile trigger for new users

-- Create the function if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS create_profile_after_user_creation ON auth.users;
CREATE TRIGGER create_profile_after_user_creation
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user();

-- 4. Fix RLS policies for profiles

-- Users can read all profiles
DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;
CREATE POLICY "Users can read all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Fix RLS policies for departments

-- Users can read all departments
DROP POLICY IF EXISTS "Users can read all departments" ON public.departments;
CREATE POLICY "Users can read all departments" 
ON public.departments 
FOR SELECT 
TO authenticated 
USING (true);

-- Only admins can modify departments
DROP POLICY IF EXISTS "Only admins can modify departments" ON public.departments;
CREATE POLICY "Only admins can modify departments" 
ON public.departments 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.role = 'ceo')
    )
);

-- 6. Update roles for existing users if needed
-- Set default role for NULL roles
UPDATE profiles 
SET role = 'user'
WHERE role IS NULL OR role = '';

-- 7. Sync department_id and role based on department_code if needed
UPDATE profiles p
SET role = 'ceo'
FROM departments d
WHERE p.department_id = d.id 
AND d.department_code = 'CEO'
AND (p.role IS NULL OR p.role = 'user');

UPDATE profiles p
SET role = 'secretary'
FROM departments d
WHERE p.department_id = d.id 
AND d.department_code = 'SEC'
AND (p.role IS NULL OR p.role = 'user');

UPDATE profiles p
SET role = 'finance'
FROM departments d
WHERE p.department_id = d.id 
AND d.department_code = 'FIN'
AND (p.role IS NULL OR p.role = 'user');

UPDATE profiles p
SET role = 'business_management'
FROM departments d
WHERE p.department_id = d.id 
AND d.department_code = 'BM'
AND (p.role IS NULL OR p.role = 'user');

UPDATE profiles p
SET role = 'auditor'
FROM departments d
WHERE p.department_id = d.id 
AND d.department_code = 'AUD'
AND (p.role IS NULL OR p.role = 'user');

UPDATE profiles p
SET role = 'welfare'
FROM departments d
WHERE p.department_id = d.id 
AND d.department_code = 'WEL'
AND (p.role IS NULL OR p.role = 'user');

UPDATE profiles p
SET role = 'board_member'
FROM departments d
WHERE p.department_id = d.id 
AND d.department_code = 'BMEM'
AND (p.role IS NULL OR p.role = 'user');

-- 8. Create updated_at trigger for all tables

-- Create the function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on profiles if it doesn't exist
DROP TRIGGER IF EXISTS update_profiles_timestamp ON public.profiles;
CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Create the trigger on departments if it doesn't exist
DROP TRIGGER IF EXISTS update_departments_timestamp ON public.departments;
CREATE TRIGGER update_departments_timestamp
BEFORE UPDATE ON public.departments
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- 9. Show summary of current database state
SELECT 'Profiles count: ' || COUNT(*) FROM profiles;
SELECT 'Departments count: ' || COUNT(*) FROM departments;
SELECT 'Users with NULL roles: ' || COUNT(*) FROM profiles WHERE role IS NULL;

-- 10. Display sample profiles to verify data
SELECT id, email, role, department_id FROM profiles LIMIT 10;
SELECT id, name, department_code FROM departments ORDER BY department_code; 