-- Seed script for task_templates table
-- This populates the database with common household tasks
-- Run this in Supabase SQL Editor after creating the schema

INSERT INTO public.task_templates (name, category, default_points, default_mental_load_points) VALUES

-- CLEANING TASKS
('Dishes (washing)', 'cleaning', 20, 0),
('Dishes (loading/unloading dishwasher)', 'cleaning', 10, 0),
('Vacuuming', 'cleaning', 30, 0),
('Mopping floors', 'cleaning', 30, 0),
('Cleaning bathrooms', 'cleaning', 40, 10),
('Cleaning kitchen surfaces', 'cleaning', 20, 0),
('Dusting', 'cleaning', 20, 0),
('Cleaning windows', 'cleaning', 30, 0),
('Taking out trash', 'cleaning', 10, 10),
('Cleaning refrigerator', 'cleaning', 40, 0),
('Cleaning oven', 'cleaning', 50, 0),
('Organizing common areas', 'cleaning', 30, 20),
('Deep cleaning (spring cleaning)', 'cleaning', 80, 20),

-- COOKING TASKS
('Meal planning', 'cooking', 20, 50),
('Grocery shopping for meals', 'cooking', 30, 20),
('Cooking breakfast', 'cooking', 20, 0),
('Cooking lunch', 'cooking', 30, 0),
('Cooking dinner', 'cooking', 40, 0),
('Meal prep (batch cooking)', 'cooking', 50, 20),
('Setting the table', 'cooking', 10, 0),
('Clearing the table', 'cooking', 10, 0),
('Packing lunches', 'cooking', 20, 10),

-- CHILDCARE TASKS
('Morning routine with kids', 'childcare', 40, 20),
('Bedtime routine with kids', 'childcare', 40, 20),
('Helping with homework', 'childcare', 30, 20),
('School drop-off', 'childcare', 20, 10),
('School pick-up', 'childcare', 20, 10),
('Organizing kids activities', 'childcare', 30, 40),
('Bathing children', 'childcare', 30, 0),
('Feeding children', 'childcare', 20, 10),
('Playing with children', 'childcare', 30, 0),
('Managing kids appointments', 'childcare', 20, 50),

-- LAUNDRY TASKS
('Doing laundry', 'laundry', 30, 0),
('Folding laundry', 'laundry', 30, 0),
('Putting away laundry', 'laundry', 20, 0),
('Ironing', 'laundry', 40, 0),
('Changing bed sheets', 'laundry', 20, 10),

-- SHOPPING TASKS
('Grocery shopping (general)', 'shopping', 30, 20),
('Shopping for household items', 'shopping', 20, 20),
('Shopping for personal items', 'shopping', 20, 10),
('Comparing prices / finding deals', 'shopping', 20, 30),

-- CAR MAINTENANCE TASKS
('Car maintenance / oil change', 'car_maintenance', 50, 20),
('Car cleaning (interior)', 'car_maintenance', 30, 0),
('Car cleaning (exterior)', 'car_maintenance', 40, 0),
('Filling up gas tank', 'car_maintenance', 10, 10),
('Car inspection / registration', 'car_maintenance', 30, 40),

-- DIY TASKS
('Home repairs', 'diy', 60, 20),
('Furniture assembly', 'diy', 50, 10),
('Painting / touch-ups', 'diy', 50, 10),
('Garden maintenance', 'diy', 40, 10),
('Yard work', 'diy', 50, 0),
('Fixing broken items', 'diy', 40, 20),

-- ADMINISTRATIVE TASKS
('Paying bills', 'administrative', 20, 30),
('Managing household budget', 'administrative', 30, 50),
('Scheduling appointments', 'administrative', 20, 40),
('Managing insurance', 'administrative', 30, 40),
('Tax preparation', 'administrative', 50, 60),
('Organizing documents', 'administrative', 30, 30),
('Coordinating household services', 'administrative', 30, 50),
('Managing subscriptions', 'administrative', 20, 30),

-- OTHER TASKS
('Pet care (feeding)', 'other', 20, 10),
('Pet care (walking)', 'other', 30, 10),
('Pet care (vet appointments)', 'other', 30, 40),
('Watering plants', 'other', 10, 10),
('Receiving packages', 'other', 10, 0),
('Managing mail', 'other', 10, 10),
('Hosting guests', 'other', 50, 40),
('Planning family events', 'other', 40, 60);

-- Note: Points are on a scale of 0-100, in increments of 10
-- default_points = effort for doing the task
-- default_mental_load_points = effort for thinking/planning about the task

