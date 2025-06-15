
-- This migration fixes a critical security vulnerability by restricting access to user profiles.

-- First, we remove the existing policy that allows anyone to view all profiles.
DROP POLICY "Profiles are viewable by everyone." ON public.profiles;

-- Then, we create a new, secure policy that only allows users to view their own profile.
CREATE POLICY "Users can view their own profile." 
ON public.profiles FOR SELECT
USING (auth.uid() = id);
