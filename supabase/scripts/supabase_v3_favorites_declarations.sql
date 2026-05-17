-- v3 : favoris par foyer, déclarations datées, attribution multi-participants
-- Exécuter dans Supabase SQL Editor sur un projet existant (après sauvegarde).
-- Idempotent : colonnes / tables IF NOT EXISTS où possible.
--
-- Prérequis : task_templates.id est un INTEGER (schéma prod Pistâches), pas un uuid.

-- ---------------------------------------------------------------------------
-- 1. Colonne onboarding (NULL = afficher la modale « tâches récurrentes »)
-- ---------------------------------------------------------------------------
ALTER TABLE public.households
  ADD COLUMN IF NOT EXISTS recurring_tasks_onboarding_completed_at timestamptz;

COMMENT ON COLUMN public.households.recurring_tasks_onboarding_completed_at IS
  'v3: NULL tant que l’utilisateur n’a pas terminé (ou ignoré) la sélection des tâches récurrentes à la création du foyer.';

-- ---------------------------------------------------------------------------
-- 2. Favoris (templates + points par défaut pour ce foyer)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.household_favorite_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households (id) ON DELETE CASCADE,
  template_id integer NOT NULL REFERENCES public.task_templates (id) ON DELETE RESTRICT,
  performer_points integer NOT NULL CHECK (performer_points >= 0 AND performer_points <= 100),
  mental_load_points integer NOT NULL CHECK (mental_load_points >= 0 AND mental_load_points <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, template_id)
);

CREATE INDEX IF NOT EXISTS household_favorite_tasks_household_id_idx
  ON public.household_favorite_tasks (household_id);

CREATE INDEX IF NOT EXISTS household_favorite_tasks_template_id_idx
  ON public.household_favorite_tasks (template_id);

-- ---------------------------------------------------------------------------
-- 3. Déclarations (une réalisation pour un jour donné)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_declarations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households (id) ON DELETE CASCADE,
  template_id integer NOT NULL REFERENCES public.task_templates (id) ON DELETE RESTRICT,
  declared_on date NOT NULL,
  performer_points integer NOT NULL CHECK (performer_points >= 0 AND performer_points <= 100),
  mental_load_points integer NOT NULL CHECK (mental_load_points >= 0 AND mental_load_points <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, template_id, declared_on)
);

CREATE INDEX IF NOT EXISTS task_declarations_household_declared_on_idx
  ON public.task_declarations (household_id, declared_on);

CREATE INDEX IF NOT EXISTS task_declarations_template_id_idx
  ON public.task_declarations (template_id);

-- ---------------------------------------------------------------------------
-- 4. Liaisons multi-participants
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_declaration_performers (
  declaration_id uuid NOT NULL REFERENCES public.task_declarations (id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES public.participants (id) ON DELETE CASCADE,
  PRIMARY KEY (declaration_id, participant_id)
);

CREATE INDEX IF NOT EXISTS task_declaration_performers_participant_idx
  ON public.task_declaration_performers (participant_id);

CREATE TABLE IF NOT EXISTS public.task_declaration_thinkers (
  declaration_id uuid NOT NULL REFERENCES public.task_declarations (id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES public.participants (id) ON DELETE CASCADE,
  PRIMARY KEY (declaration_id, participant_id)
);

CREATE INDEX IF NOT EXISTS task_declaration_thinkers_participant_idx
  ON public.task_declaration_thinkers (participant_id);

-- ---------------------------------------------------------------------------
-- 5. RPC : tout membre du foyer (ou propriétaire) peut marquer l’onboarding terminé
--    sans pouvoir modifier les autres colonnes de households.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.v3_complete_recurring_onboarding(p_household_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.participants
    WHERE household_id = p_household_id AND user_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM public.households
    WHERE id = p_household_id AND owner = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not a member of this household';
  END IF;

  UPDATE public.households
  SET recurring_tasks_onboarding_completed_at = now()
  WHERE id = p_household_id;
END;
$$;

REVOKE ALL ON FUNCTION public.v3_complete_recurring_onboarding(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.v3_complete_recurring_onboarding(uuid) TO authenticated;
