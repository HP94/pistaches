-- ÉTAPE 2 / 2 — Données task_templates (TASKS_CATEGORIES.md 2026)
--
-- Obligatoire avant : exécuter une fois (seul) :
--   supabase_migration_TASKS_CATEGORIES_2026_1_enum.sql
-- puis ce fichier, dans une deuxième exécution SQL.
--
-- Si pet_care / travel existent déjà, vous pouvez exécuter uniquement ce script.

-- Ancienne catégorie childcare → parenting
UPDATE public.task_templates
SET category = 'parenting'::public.task_category
WHERE category::text = 'childcare';

-- Renommages (noms EN = clé unique côté app)
UPDATE public.task_templates SET name = 'Changing bed sheets / towels' WHERE name = 'Changing bed sheets';
UPDATE public.task_templates SET name = 'Painting / repairs' WHERE name = 'Painting / touch-ups';
UPDATE public.task_templates SET name = 'Loading/unloading dishwasher' WHERE name = 'Dishes (loading/unloading dishwasher)';
UPDATE public.task_templates SET name = 'Cleaning kitchen' WHERE name = 'Cleaning kitchen surfaces';
UPDATE public.task_templates SET name = 'Tax Managing' WHERE name = 'Tax preparation';
UPDATE public.task_templates SET name = 'Feeding pet' WHERE name = 'Pet care (feeding)';
UPDATE public.task_templates SET name = 'Walking pet' WHERE name = 'Pet care (walking)';
UPDATE public.task_templates SET name = 'Vet appointments' WHERE name = 'Pet care (vet appointments)';

-- Animaux → catégorie pet_care
UPDATE public.task_templates
SET category = 'pet_care'::public.task_category
WHERE name IN ('Feeding pet', 'Walking pet', 'Vet appointments');

-- Points / charge mentale (valeurs du markdown)
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 0 WHERE name = 'Dishes (washing)';
UPDATE public.task_templates SET default_points = 10, default_mental_load_points = 0 WHERE name = 'Loading/unloading dishwasher';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 0 WHERE name = 'Vacuuming';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 0 WHERE name = 'Mopping floors';
UPDATE public.task_templates SET default_points = 40, default_mental_load_points = 10 WHERE name = 'Cleaning bathrooms';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 0 WHERE name = 'Cleaning kitchen';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 0 WHERE name = 'Dusting';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 10 WHERE name = 'Cleaning windows';
UPDATE public.task_templates SET default_points = 10, default_mental_load_points = 10 WHERE name = 'Taking out trash';
UPDATE public.task_templates SET default_points = 40, default_mental_load_points = 0 WHERE name = 'Cleaning refrigerator';
UPDATE public.task_templates SET default_points = 50, default_mental_load_points = 0 WHERE name = 'Cleaning oven';

UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 50 WHERE name = 'Meal planning';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 20 WHERE name = 'Grocery shopping for meals';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 0 WHERE name = 'Cooking breakfast';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 0 WHERE name = 'Cooking Meals';
UPDATE public.task_templates SET default_points = 10, default_mental_load_points = 0 WHERE name = 'Setting the table';

UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 20 WHERE name = 'Helping with homework';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 10 WHERE name = 'School drop-off';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 10 WHERE name = 'School pick-up';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 40 WHERE name = 'Organizing kids activities';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 0 WHERE name = 'Bathing children';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 10 WHERE name = 'Feeding children';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 0 WHERE name = 'Playing with children';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 50 WHERE name = 'Managing kids appointments';

UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 10 WHERE name = 'Doing laundry';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 10 WHERE name = 'Folding laundry';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 10 WHERE name = 'Putting away laundry';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 10 WHERE name = 'Hang out the laundry';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 10 WHERE name = 'Take the laundry down';
UPDATE public.task_templates SET default_points = 40, default_mental_load_points = 10 WHERE name = 'Ironing';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 10 WHERE name = 'Changing bed sheets / towels';

UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 20 WHERE name = 'Shopping for household items';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 30 WHERE name = 'Comparing prices / finding deals';

UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 20 WHERE name = 'Car maintenance / oil change';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 0 WHERE name = 'Car cleaning (interior)';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 0 WHERE name = 'Car cleaning (exterior)';
UPDATE public.task_templates SET default_points = 10, default_mental_load_points = 0 WHERE name = 'Filling up gas tank';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 20 WHERE name = 'Car inspection / registration';

UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 10 WHERE name = 'Furniture assembly';
UPDATE public.task_templates SET default_points = 40, default_mental_load_points = 10 WHERE name = 'Painting / repairs';
UPDATE public.task_templates SET default_points = 40, default_mental_load_points = 10 WHERE name = 'Garden maintenance';

UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 30 WHERE name = 'Paying bills';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 50 WHERE name = 'Managing household budget';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 50 WHERE name = 'Managing insurance';
UPDATE public.task_templates SET default_points = 50, default_mental_load_points = 60 WHERE name = 'Tax Managing';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 40 WHERE name = 'Organizing documents';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 30 WHERE name = 'Managing subscriptions';

UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 10 WHERE name = 'Feeding pet';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 0 WHERE name = 'Walking pet';
UPDATE public.task_templates SET default_points = 20, default_mental_load_points = 30 WHERE name = 'Vet appointments';

UPDATE public.task_templates SET default_points = 10, default_mental_load_points = 0 WHERE name = 'Watering plants';
UPDATE public.task_templates SET default_points = 10, default_mental_load_points = 0 WHERE name = 'Receiving packages';
UPDATE public.task_templates SET default_points = 30, default_mental_load_points = 60 WHERE name = 'Planning family events';

-- Nouvelles tâches
INSERT INTO public.task_templates (name, category, default_points, default_mental_load_points)
SELECT v.name, v.category::public.task_category, v.default_points, v.default_mental_load_points
FROM (
  VALUES
    ('Cooking Meals', 'cooking', 30, 0),
    ('Cleaning toilets', 'cleaning', 40, 10),
    ('Wake up kids', 'parenting', 40, 20),
    ('Dress the kids', 'parenting', 40, 20),
    ('Read a story', 'parenting', 40, 20),
    ('Change diapers', 'parenting', 40, 20),
    ('Night baby care', 'parenting', 60, 0),
    ('Buy clothes', 'parenting', 30, 20),
    ('Take them to activities', 'parenting', 20, 10),
    ('Pick them up from activities', 'parenting', 20, 10),
    ('Clean the litter box', 'pet_care', 20, 30),
    ('Plan trips', 'travel', 30, 30),
    ('Plan weekends', 'travel', 40, 50),
    ('Upkeep / DIY', 'diy', 40, 20)
) AS v(name, category, default_points, default_mental_load_points)
WHERE NOT EXISTS (SELECT 1 FROM public.task_templates tt WHERE tt.name = v.name);

-- Supprimer les modèles retirés du catalogue (uniquement s’ils ne sont référencés par aucune tâche)
DELETE FROM public.task_templates tt
WHERE tt.name IN (
  'Deep cleaning (spring cleaning)',
  'Organizing common areas',
  'Cooking lunch',
  'Cooking dinner',
  'Meal prep (batch cooking)',
  'Clearing the table',
  'Packing lunches',
  'Morning routine with kids',
  'Bedtime routine with kids',
  'Grocery shopping (general)',
  'Shopping for personal items',
  'Home repairs',
  'Yard work',
  'Fixing broken items',
  'Scheduling appointments',
  'Coordinating household services',
  'Managing mail',
  'Hosting guests',
  'Changing light bulbs'
)
AND NOT EXISTS (SELECT 1 FROM public.tasks t WHERE t.template_id = tt.id);
