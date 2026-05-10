-- Fix RLS policies for participants table (NO RECURSION VERSION)
-- Run this in Supabase SQL Editor
-- 
-- IMPORTANT: The SELECT policy cannot check if user is participant by reading from participants
-- (that would cause infinite recursion). Instead, we check:
-- 1. User is owner of household
-- 2. User is reading their own participant (user_id matches)
-- 3. For now, we allow authenticated users to read (simplified for MVP)

-- Ensure RLS is enabled
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "participants household access" ON public.participants;
DROP POLICY IF EXISTS "Allow read participants in household" ON public.participants;
DROP POLICY IF EXISTS "Allow insert participants in household" ON public.participants;
DROP POLICY IF EXISTS "Test insert participants" ON public.participants;
DROP POLICY IF EXISTS "Simple insert policy" ON public.participants;
DROP POLICY IF EXISTS "Allow update participants in household" ON public.participants;
DROP POLICY IF EXISTS "Allow delete participants in household" ON public.participants;

-- Policy 1: SELECT - Users can read participants if:
-- - They are owner of the household, OR
-- - They are reading their own participant (user_id matches), OR
-- - For MVP simplicity: any authenticated user can read (we control access via INSERT policy)
CREATE POLICY "Allow read participants in household"
  ON public.participants
  FOR SELECT
  USING (
    -- User is owner of the household
    EXISTS (
      SELECT 1 FROM public.households
      WHERE households.id = participants.household_id
        AND households.owner = auth.uid()
    )
    OR
    -- User is reading their own participant record
    participants.user_id = auth.uid()
    OR
    -- For MVP: Allow any authenticated user to read (simplifies things)
    -- The INSERT policy will control who can actually join
    auth.role() = 'authenticated'
  );

-- Policy 2: INSERT - Users can insert participants if:
-- - They are the owner of the household, OR
-- - They are creating their own participant (user_id = auth.uid())
CREATE POLICY "Allow insert participants in household"
  ON public.participants
  FOR INSERT
  WITH CHECK (
    -- User is owner of the household
    EXISTS (
      SELECT 1 FROM public.households
      WHERE households.id = participants.household_id
        AND households.owner = auth.uid()
    )
    OR
    -- User is creating their own participant (when joining a household)
    user_id = auth.uid()
  );

-- Policy 3: UPDATE
CREATE POLICY "Allow update participants in household"
  ON public.participants
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.households
      WHERE households.id = participants.household_id
        AND households.owner = auth.uid()
    )
    OR
    participants.user_id = auth.uid()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.households
      WHERE households.id = participants.household_id
        AND households.owner = auth.uid()
    )
    OR
    user_id = auth.uid()
  );

-- Policy 4: DELETE
CREATE POLICY "Allow delete participants in household"
  ON public.participants
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.households
      WHERE households.id = participants.household_id
        AND households.owner = auth.uid()
    )
  );

