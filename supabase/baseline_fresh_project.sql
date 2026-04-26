-- Schéma minimal pour un nouveau projet Supabase (base vide), aligné sur l’app Pistâches.
-- À exécuter dans le SQL Editor du projet « local pistache » (dans l’ordre : ce fichier d’abord).
-- Ensuite : policies RLS (fichiers supabase_*_rls.sql, etc.) et seeds (voir commentaire en fin de fichier).

-- ---------------------------------------------------------------------------
-- 1. Enum catégories de tâches (inclut childcare pour compatibilité anciens seeds)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_category') THEN
    CREATE TYPE public.task_category AS ENUM (
      'administrative',
      'car_maintenance',
      'childcare',
      'cleaning',
      'cooking',
      'diy',
      'laundry',
      'other',
      'parenting',
      'pet_care',
      'shopping',
      'travel'
    );
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  invitation_code text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS households_owner_idx ON public.households (owner);
CREATE INDEX IF NOT EXISTS households_invitation_code_idx ON public.households (invitation_code);

CREATE TABLE IF NOT EXISTS public.participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households (id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'neutral')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS participants_household_id_idx ON public.participants (household_id);
CREATE INDEX IF NOT EXISTS participants_user_id_idx ON public.participants (user_id);

CREATE TABLE IF NOT EXISTS public.task_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category public.task_category NOT NULL,
  default_points integer NOT NULL CHECK (default_points >= 0 AND default_points <= 100),
  default_mental_load_points integer NOT NULL CHECK (
    default_mental_load_points >= 0 AND default_mental_load_points <= 100
  ),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households (id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.task_templates (id) ON DELETE RESTRICT,
  performer_points integer CHECK (performer_points IS NULL OR (performer_points >= 0 AND performer_points <= 100)),
  mental_load_points integer CHECK (mental_load_points IS NULL OR (mental_load_points >= 0 AND mental_load_points <= 100)),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tasks_household_id_idx ON public.tasks (household_id);
CREATE INDEX IF NOT EXISTS tasks_template_id_idx ON public.tasks (template_id);

CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  performer_id uuid REFERENCES public.participants (id) ON DELETE SET NULL,
  thinker_id uuid REFERENCES public.participants (id) ON DELETE SET NULL,
  frequency_per_week integer CHECK (frequency_per_week IS NULL OR frequency_per_week >= 1),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS assignments_task_id_idx ON public.assignments (task_id);
CREATE INDEX IF NOT EXISTS assignments_performer_id_idx ON public.assignments (performer_id);
CREATE INDEX IF NOT EXISTS assignments_thinker_id_idx ON public.assignments (thinker_id);

-- ---------------------------------------------------------------------------
-- 3. Suite recommandée (dans l’éditeur SQL, fichiers du repo, dans cet ordre)
-- ---------------------------------------------------------------------------
-- A) supabase_tasks_analytics_setup_corrected.sql (colonnes tasks si besoin + RPC get_task_points + vue analytics)
-- B) supabase_tasks_assignments_rls.sql
-- C) supabase_task_templates_rls.sql
-- D) supabase_fix_household_rls.sql
-- E) supabase_fix_participants_rls_no_recursion.sql (ou supabase_participants_update_rls_core3.sql selon la prod)
-- F) supabase_participant_claim_rls.sql
-- G) supabase_migration_TASKS_CATEGORIES_2026_1_enum.sql (optionnel : pet_care/travel déjà dans l’enum ci-dessus)
-- H) supabase_migration_TASKS_CATEGORIES_2026.sql (données templates à jour)
-- I) supabase_seed_task_templates.sql (seulement si tu n’exécutes pas H ou pour compléter)
--
-- Évite sur une base neuve : supabase_fix_tasks_name_column.sql (nettoyage d’anciennes colonnes absentes ici).
-- Les scripts RLS / analytics en fin de fichier peuvent contenir des GRANT ; sinon, accorder manuellement
-- les droits SELECT/INSERT/UPDATE/DELETE sur public.* au rôle authenticated si besoin.
