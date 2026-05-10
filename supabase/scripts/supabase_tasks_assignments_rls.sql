-- RLS Policies for tasks and assignments tables
-- Run this in Supabase SQL Editor
-- 
-- This allows all members of a household to see and manage tasks and assignments
-- A user is considered a member if they have a participant record in the household

-- ============================================
-- TASKS TABLE POLICIES
-- ============================================

-- Enable RLS on tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read tasks in household" ON public.tasks;
DROP POLICY IF EXISTS "Allow insert tasks in household" ON public.tasks;
DROP POLICY IF EXISTS "Allow update tasks in household" ON public.tasks;
DROP POLICY IF EXISTS "Allow delete tasks in household" ON public.tasks;

-- Policy 1: SELECT - Users can read tasks if they are members of the household
CREATE POLICY "Allow read tasks in household"
  ON public.tasks
  FOR SELECT
  USING (
    -- User is a member of the household (has a participant record)
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE participants.household_id = tasks.household_id
        AND participants.user_id = auth.uid()
    )
    OR
    -- User is the owner of the household
    EXISTS (
      SELECT 1 FROM public.households
      WHERE households.id = tasks.household_id
        AND households.owner = auth.uid()
    )
  );

-- Policy 2: INSERT - Users can create tasks if they are members of the household
CREATE POLICY "Allow insert tasks in household"
  ON public.tasks
  FOR INSERT
  WITH CHECK (
    -- User is a member of the household
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE participants.household_id = tasks.household_id
        AND participants.user_id = auth.uid()
    )
    OR
    -- User is the owner of the household
    EXISTS (
      SELECT 1 FROM public.households
      WHERE households.id = tasks.household_id
        AND households.owner = auth.uid()
    )
  );

-- Policy 3: UPDATE - Users can update tasks if they are members of the household
CREATE POLICY "Allow update tasks in household"
  ON public.tasks
  FOR UPDATE
  USING (
    -- User is a member of the household
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE participants.household_id = tasks.household_id
        AND participants.user_id = auth.uid()
    )
    OR
    -- User is the owner of the household
    EXISTS (
      SELECT 1 FROM public.households
      WHERE households.id = tasks.household_id
        AND households.owner = auth.uid()
    )
  )
  WITH CHECK (
    -- Same check for the updated row
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE participants.household_id = tasks.household_id
        AND participants.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.households
      WHERE households.id = tasks.household_id
        AND households.owner = auth.uid()
    )
  );

-- Policy 4: DELETE - Users can delete tasks if they are members of the household
CREATE POLICY "Allow delete tasks in household"
  ON public.tasks
  FOR DELETE
  USING (
    -- User is a member of the household
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE participants.household_id = tasks.household_id
        AND participants.user_id = auth.uid()
    )
    OR
    -- User is the owner of the household
    EXISTS (
      SELECT 1 FROM public.households
      WHERE households.id = tasks.household_id
        AND households.owner = auth.uid()
    )
  );

-- ============================================
-- ASSIGNMENTS TABLE POLICIES
-- ============================================

-- Enable RLS on assignments table
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read assignments in household" ON public.assignments;
DROP POLICY IF EXISTS "Allow insert assignments in household" ON public.assignments;
DROP POLICY IF EXISTS "Allow update assignments in household" ON public.assignments;
DROP POLICY IF EXISTS "Allow delete assignments in household" ON public.assignments;

-- Policy 1: SELECT - Users can read assignments if they are members of the household
CREATE POLICY "Allow read assignments in household"
  ON public.assignments
  FOR SELECT
  USING (
    -- User is a member of the household (check via tasks -> household)
    EXISTS (
      SELECT 1 FROM public.tasks
      INNER JOIN public.participants ON participants.household_id = tasks.household_id
      WHERE tasks.id = assignments.task_id
        AND participants.user_id = auth.uid()
    )
    OR
    -- User is the owner of the household (check via tasks -> household)
    EXISTS (
      SELECT 1 FROM public.tasks
      INNER JOIN public.households ON households.id = tasks.household_id
      WHERE tasks.id = assignments.task_id
        AND households.owner = auth.uid()
    )
  );

-- Policy 2: INSERT - Users can create assignments if they are members of the household
CREATE POLICY "Allow insert assignments in household"
  ON public.assignments
  FOR INSERT
  WITH CHECK (
    -- User is a member of the household (check via tasks -> household)
    EXISTS (
      SELECT 1 FROM public.tasks
      INNER JOIN public.participants ON participants.household_id = tasks.household_id
      WHERE tasks.id = assignments.task_id
        AND participants.user_id = auth.uid()
    )
    OR
    -- User is the owner of the household (check via tasks -> household)
    EXISTS (
      SELECT 1 FROM public.tasks
      INNER JOIN public.households ON households.id = tasks.household_id
      WHERE tasks.id = assignments.task_id
        AND households.owner = auth.uid()
    )
  );

-- Policy 3: UPDATE - Users can update assignments if they are members of the household
CREATE POLICY "Allow update assignments in household"
  ON public.assignments
  FOR UPDATE
  USING (
    -- User is a member of the household
    EXISTS (
      SELECT 1 FROM public.tasks
      INNER JOIN public.participants ON participants.household_id = tasks.household_id
      WHERE tasks.id = assignments.task_id
        AND participants.user_id = auth.uid()
    )
    OR
    -- User is the owner of the household
    EXISTS (
      SELECT 1 FROM public.tasks
      INNER JOIN public.households ON households.id = tasks.household_id
      WHERE tasks.id = assignments.task_id
        AND households.owner = auth.uid()
    )
  )
  WITH CHECK (
    -- Same check for the updated row
    EXISTS (
      SELECT 1 FROM public.tasks
      INNER JOIN public.participants ON participants.household_id = tasks.household_id
      WHERE tasks.id = assignments.task_id
        AND participants.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.tasks
      INNER JOIN public.households ON households.id = tasks.household_id
      WHERE tasks.id = assignments.task_id
        AND households.owner = auth.uid()
    )
  );

-- Policy 4: DELETE - Users can delete assignments if they are members of the household
CREATE POLICY "Allow delete assignments in household"
  ON public.assignments
  FOR DELETE
  USING (
    -- User is a member of the household
    EXISTS (
      SELECT 1 FROM public.tasks
      INNER JOIN public.participants ON participants.household_id = tasks.household_id
      WHERE tasks.id = assignments.task_id
        AND participants.user_id = auth.uid()
    )
    OR
    -- User is the owner of the household
    EXISTS (
      SELECT 1 FROM public.tasks
      INNER JOIN public.households ON households.id = tasks.household_id
      WHERE tasks.id = assignments.task_id
        AND households.owner = auth.uid()
    )
  );

