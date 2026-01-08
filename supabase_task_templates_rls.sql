-- RLS Policies for task_templates table
-- Run this in Supabase SQL Editor
-- 
-- This allows authenticated users to read task templates

-- Enable RLS
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated read task templates" ON public.task_templates;

-- Policy: Allow all authenticated users to read task templates
CREATE POLICY "Allow authenticated read task templates"
  ON public.task_templates
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Note: task_templates are read-only for users (they can't modify them)
-- Only admins can modify templates via Supabase dashboard

