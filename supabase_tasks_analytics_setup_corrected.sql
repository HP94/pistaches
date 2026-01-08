-- Setup for tasks with customizable points and analytics (CORRECTED VERSION)
-- Run this in Supabase SQL Editor
--
-- Structure: assignments → tasks → task_templates
-- Points are stored in tasks table (not assignments) for centralization
--
-- This script:
-- 1. Ensures tasks table has performer_points and mental_load_points columns
-- 2. Creates a view for analytics (average points per task template)
-- 3. Ensures assignments reference tasks correctly

-- Step 1: Ensure tasks table has performer_points and mental_load_points columns
-- These should be nullable initially, defaulting to template values
DO $$
BEGIN
  -- Add performer_points if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tasks' 
    AND column_name = 'performer_points'
  ) THEN
    ALTER TABLE public.tasks 
    ADD COLUMN performer_points integer CHECK (performer_points IS NULL OR (performer_points >= 0 AND performer_points <= 100));
  END IF;
  
  -- Add mental_load_points if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tasks' 
    AND column_name = 'mental_load_points'
  ) THEN
    ALTER TABLE public.tasks 
    ADD COLUMN mental_load_points integer CHECK (mental_load_points IS NULL OR (mental_load_points >= 0 AND mental_load_points <= 100));
  END IF;
END $$;

-- Step 2: Create a function to get the effective points for a task
-- If points are NULL in tasks, use template defaults
CREATE OR REPLACE FUNCTION public.get_task_points(task_uuid uuid)
RETURNS TABLE (
  performer_points integer,
  mental_load_points integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(t.performer_points, tt.default_points)::integer AS performer_points,
    COALESCE(t.mental_load_points, tt.default_mental_load_points)::integer AS mental_load_points
  FROM public.tasks t
  JOIN public.task_templates tt ON tt.id = t.template_id
  WHERE t.id = task_uuid;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create a view for analytics - Average points per task template
-- This aggregates points from tasks (not assignments) grouped by template
CREATE OR REPLACE VIEW public.task_template_analytics AS
SELECT 
  tt.id AS task_template_id,
  tt.name AS task_name,
  tt.category,
  tt.default_points AS template_default_points,
  tt.default_mental_load_points AS template_default_mental_load_points,
  
  -- Average performer points across all tasks (using effective points)
  COALESCE(AVG(COALESCE(t.performer_points, tt.default_points)), 0)::numeric(10,2) AS avg_performer_points,
  
  -- Average mental load points across all tasks (using effective points)
  COALESCE(AVG(COALESCE(t.mental_load_points, tt.default_mental_load_points)), 0)::numeric(10,2) AS avg_mental_load_points,
  
  -- Count of tasks using this template
  COUNT(t.id) AS task_count,
  
  -- Count of unique households using this template
  COUNT(DISTINCT t.household_id) AS household_count,
  
  -- Count of assignments using tasks with this template
  COUNT(DISTINCT a.id) AS assignment_count
  
FROM public.task_templates tt
LEFT JOIN public.tasks t ON t.template_id = tt.id
LEFT JOIN public.assignments a ON a.task_id = t.id
GROUP BY tt.id, tt.name, tt.category, tt.default_points, tt.default_mental_load_points;

-- Step 4: Create a function to get average points for a specific task template
CREATE OR REPLACE FUNCTION public.get_task_template_averages(task_template_uuid uuid)
RETURNS TABLE (
  task_name text,
  category text,
  template_default_points integer,
  template_default_mental_load_points integer,
  avg_performer_points numeric,
  avg_mental_load_points numeric,
  task_count bigint,
  household_count bigint,
  assignment_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tt.name,
    tt.category,
    tt.default_points,
    tt.default_mental_load_points,
    COALESCE(AVG(COALESCE(t.performer_points, tt.default_points)), 0)::numeric(10,2) AS avg_performer_points,
    COALESCE(AVG(COALESCE(t.mental_load_points, tt.default_mental_load_points)), 0)::numeric(10,2) AS avg_mental_load_points,
    COUNT(DISTINCT t.id) AS task_count,
    COUNT(DISTINCT t.household_id) AS household_count,
    COUNT(DISTINCT a.id) AS assignment_count
  FROM public.task_templates tt
  LEFT JOIN public.tasks t ON t.template_id = tt.id
  LEFT JOIN public.assignments a ON a.task_id = t.id
  WHERE tt.id = task_template_uuid
  GROUP BY tt.id, tt.name, tt.category, tt.default_points, tt.default_mental_load_points;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Grant access to the view and function for authenticated users
GRANT SELECT ON public.task_template_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_task_points(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_task_template_averages(uuid) TO authenticated;

-- Note: 
-- - When creating a task from a template, performer_points and mental_load_points are NULL by default
-- - The application should use template defaults initially
-- - Participants can modify these points in the tasks table
-- - All assignments referencing a task will use the same points (from tasks table)
-- - Analytics view shows averages across all tasks (not assignments) grouped by template
-- - For a given task, different assignments can have different performer_id and responsible_id
--
-- Analytics Usage:
-- You can query the view directly in Supabase SQL Editor:
--   SELECT * FROM task_template_analytics ORDER BY avg_performer_points DESC;
-- Or use the function for a specific template:
--   SELECT * FROM get_task_template_averages('template-uuid-here');

