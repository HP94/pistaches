-- Fix tasks table: Remove obsolete columns that should come from task_templates
-- The name and category should come from task_templates, not be stored in tasks
-- The old "points" column is replaced by "performer_points" and "mental_load_points"
-- Run this in Supabase SQL Editor

-- Remove the name column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tasks' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.tasks DROP COLUMN name;
    RAISE NOTICE 'Column "name" removed from tasks table';
  ELSE
    RAISE NOTICE 'Column "name" does not exist in tasks table';
  END IF;
END $$;

-- Remove the category column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tasks' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.tasks DROP COLUMN category;
    RAISE NOTICE 'Column "category" removed from tasks table';
  ELSE
    RAISE NOTICE 'Column "category" does not exist in tasks table';
  END IF;
END $$;

-- Remove the old "points" column if it exists (replaced by performer_points and mental_load_points)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tasks' 
    AND column_name = 'points'
  ) THEN
    ALTER TABLE public.tasks DROP COLUMN points;
    RAISE NOTICE 'Column "points" removed from tasks table (replaced by performer_points and mental_load_points)';
  ELSE
    RAISE NOTICE 'Column "points" does not exist in tasks table';
  END IF;
END $$;

