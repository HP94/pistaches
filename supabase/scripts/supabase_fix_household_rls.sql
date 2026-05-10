-- Fix RLS policies for households table to allow joining by invitation code
-- Run this in Supabase SQL Editor

-- First, let's check if RLS is enabled (it should be from the original schema)
-- If not, enable it
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them properly)
DROP POLICY IF EXISTS "household owner select" ON public.households;
DROP POLICY IF EXISTS "household owner insert" ON public.households;
DROP POLICY IF EXISTS "household owner update" ON public.households;
DROP POLICY IF EXISTS "household owner all" ON public.households;
DROP POLICY IF EXISTS "Allow read by invitation code" ON public.households;
DROP POLICY IF EXISTS "Allow authenticated read" ON public.households;

-- Policy 1: Owner can do everything with their households
CREATE POLICY "household owner all"
  ON public.households
  FOR ALL
  USING (auth.uid() = owner)
  WITH CHECK (auth.uid() = owner);

-- Policy 2: Any authenticated user can read households (needed for joining by code)
-- This is necessary because we can't filter by invitation_code in RLS policies
-- The application code will still validate the code before allowing join
CREATE POLICY "Allow authenticated read"
  ON public.households
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Note: This allows any authenticated user to read any household
-- This is necessary for the join-by-code functionality to work
-- The application code validates the invitation code before allowing the join

