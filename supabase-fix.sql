-- Fix for common Supabase authentication issues

-- 1. First check if the email confirmation is enabled but might be failing
SELECT coalesce(raw_app_meta_data->>'email_confirmed_at', '')::varchar FROM auth.users LIMIT 1;

-- 2. Make sure the trigger function exists for creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    -- Create a profile for the new user
    INSERT INTO public.profiles (id, email, role)
    VALUES (new.id, new.email, 'user')
    ON CONFLICT (id) DO NOTHING;
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Make sure the trigger is properly attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Check if profiles table exists, create it if not
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'user',
    department_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Add RLS policies for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own profile
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users can read their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Policy to allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- 6. Create a basic departments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add some basic departments if none exist
INSERT INTO public.departments (name, department_code)
SELECT 'CEO Office', 'CEO'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE department_code = 'CEO');

INSERT INTO public.departments (name, department_code)
SELECT 'Secretary', 'SEC'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE department_code = 'SEC');

INSERT INTO public.departments (name, department_code)
SELECT 'Finance', 'FIN'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE department_code = 'FIN');

INSERT INTO public.departments (name, department_code)
SELECT 'Business Management', 'BM'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE department_code = 'BM');

INSERT INTO public.departments (name, department_code)
SELECT 'Auditor', 'AUD'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE department_code = 'AUD');

INSERT INTO public.departments (name, department_code)
SELECT 'Welfare', 'WEL'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE department_code = 'WEL');

INSERT INTO public.departments (name, department_code)
SELECT 'Board Member', 'BMEM'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE department_code = 'BMEM');

-- Add RLS policies for the departments table
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read departments
DROP POLICY IF EXISTS "Allow authenticated users to read departments" ON public.departments;
CREATE POLICY "Allow authenticated users to read departments" 
ON public.departments 
FOR SELECT 
TO authenticated 
USING (true);

-- 7. Make sure email confirmation is set correctly in auth settings
-- This cannot be done via SQL, but needs to be checked in the Supabase dashboard:
-- Go to Authentication > Settings > Email Auth > Email confirmations
-- Make sure it's set correctly based on your requirements 