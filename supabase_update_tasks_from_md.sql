-- Mise à jour des task_templates depuis TASKS_CATEGORIES.md
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. Ajouter 'parenting' à l'enum task_category (requis avant l'UPDATE)
ALTER TYPE task_category ADD VALUE IF NOT EXISTS 'parenting';

-- 2. Renommer la catégorie childcare -> parenting
-- Utilise category::text pour éviter l'erreur "invalid input value for enum" dans le WHERE
UPDATE public.task_templates 
SET category = 'parenting'
WHERE LOWER(category::text) = 'childcare';

-- 2. Renommer et mettre à jour les tâches existantes
UPDATE public.task_templates SET name = 'Loading/unloading dishwasher', default_points = 10, default_mental_load_points = 0 WHERE name = 'Dishes (loading/unloading dishwasher)';
UPDATE public.task_templates SET name = 'Cleaning kitchen', default_points = 20, default_mental_load_points = 0 WHERE name = 'Cleaning kitchen surfaces';
UPDATE public.task_templates SET name = 'Tax Managing', default_points = 50, default_mental_load_points = 60 WHERE name = 'Tax preparation';
UPDATE public.task_templates SET name = 'Feeding pet', default_points = 20, default_mental_load_points = 10 WHERE name = 'Pet care (feeding)';
UPDATE public.task_templates SET name = 'Walking pet', default_points = 20, default_mental_load_points = 0 WHERE name = 'Pet care (walking)';
UPDATE public.task_templates SET name = 'Vet appointments', default_points = 20, default_mental_load_points = 30 WHERE name = 'Pet care (vet appointments)';

-- 3. Mettre à jour les points des tâches existantes (sans changement de nom)
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 0 WHERE name = 'Dishes (washing)';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 0 WHERE name = 'Vacuuming';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 0 WHERE name = 'Mopping floors';
UPDATE public.task_templates SET default_points = 40, default_mental_load_points = 10 WHERE name = 'Cleaning bathrooms';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 0 WHERE name = 'Dusting';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 0 WHERE name = 'Cleaning windows';
UPDATE public.task_templates SET default_points = 10, default_mental_load_points = 10 WHERE name = 'Taking out trash';
UPDATE public.task_templates SET default_points = 40, default_mental_load_points = 0 WHERE name = 'Cleaning refrigerator';
UPDATE public.task_templates SET default_points = 50, default_mental_load_points = 0 WHERE name = 'Cleaning oven';
UPDATE public.task_templates SET default_points = 80, default_mental_load_points = 20 WHERE name = 'Deep cleaning (spring cleaning)';

UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 0 WHERE name = 'Doing laundry';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 10 WHERE name = 'Folding laundry';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 10 WHERE name = 'Putting away laundry';
UPDATE public.task_templates SET default_points = 40, default_mental_load_points = 10 WHERE name = 'Ironing';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 10 WHERE name = 'Changing bed sheets';

UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 20 WHERE name = 'Shopping for household items';
UPDATE public.task_templates SET default_points = 40, default_mental_load_points = 20 WHERE name = 'Car maintenance / oil change';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 30 WHERE name = 'Car inspection / registration';
UPDATE public.task_templates SET default_points = 10, default_mental_load_points = 0 WHERE name = 'Filling up gas tank';

UPDATE public.task_templates SET default_points = 50, default_mental_load_points = 20 WHERE name = 'Home repairs';
UPDATE public.task_templates SET default_points = 40, default_mental_load_points = 10 WHERE name = 'Furniture assembly';
UPDATE public.task_templates SET default_points = 40, default_mental_load_points = 10 WHERE name = 'Painting / touch-ups';
UPDATE public.task_templates SET default_points = 40, default_mental_load_points = 10 WHERE name = 'Garden maintenance';
UPDATE public.task_templates SET default_points = 50, default_mental_load_points = 0 WHERE name = 'Yard work';
UPDATE public.task_templates SET default_points = 10, default_mental_load_points = 0 WHERE name = 'Changing light bulbs';
UPDATE public.task_templates SET default_points = 40, default_mental_load_points = 20 WHERE name = 'Fixing broken items';

UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 40 WHERE name = 'Organizing documents';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 30 WHERE name = 'Managing subscriptions';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 50 WHERE name = 'Managing insurance';

UPDATE public.task_templates SET default_points = 10, default_mental_load_points = 0 WHERE name = 'Watering plants';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 60 WHERE name = 'Planning family events';

-- 4. Insérer les nouvelles tâches (si elles n'existent pas)
INSERT INTO public.task_templates (name, category, default_points, default_mental_load_points)
SELECT v.name, v.category::task_category, v.default_points, v.default_mental_load_points
FROM (VALUES
  ('Cleaning toilets', 'cleaning', 40, 10),
  ('Cooking Meals', 'cooking', 30, 0),
  ('Hang out the laundry', 'laundry', 30, 10),
  ('Take the laundry down', 'laundry', 20, 10)
) AS v(name, category, default_points, default_mental_load_points)
WHERE NOT EXISTS (SELECT 1 FROM public.task_templates tt WHERE tt.name = v.name);

-- Note: Les anciennes tâches supprimées du MD (Organizing common areas, Cooking lunch, etc.)
-- restent en base pour éviter de casser les tâches existantes des foyers.
-- Vous pouvez les supprimer manuellement dans Supabase si souhaité.
