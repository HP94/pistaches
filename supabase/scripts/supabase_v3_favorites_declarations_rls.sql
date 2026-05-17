-- v3 RLS : household_favorite_tasks, task_declarations, liaisons
-- Prérequis : supabase_v3_favorites_declarations.sql exécuté.

-- ---------------------------------------------------------------------------
-- Helpers : membre du foyer (participant lié) ou propriétaire
-- (même logique que tasks / assignments)
-- ---------------------------------------------------------------------------

-- household_favorite_tasks
ALTER TABLE public.household_favorite_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "v3_favorites_select" ON public.household_favorite_tasks;
DROP POLICY IF EXISTS "v3_favorites_insert" ON public.household_favorite_tasks;
DROP POLICY IF EXISTS "v3_favorites_update" ON public.household_favorite_tasks;
DROP POLICY IF EXISTS "v3_favorites_delete" ON public.household_favorite_tasks;

CREATE POLICY "v3_favorites_select"
  ON public.household_favorite_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.participants p
      WHERE p.household_id = household_favorite_tasks.household_id AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.households h
      WHERE h.id = household_favorite_tasks.household_id AND h.owner = auth.uid()
    )
  );

CREATE POLICY "v3_favorites_insert"
  ON public.household_favorite_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.participants p
      WHERE p.household_id = household_favorite_tasks.household_id AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.households h
      WHERE h.id = household_favorite_tasks.household_id AND h.owner = auth.uid()
    )
  );

CREATE POLICY "v3_favorites_update"
  ON public.household_favorite_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.participants p
      WHERE p.household_id = household_favorite_tasks.household_id AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.households h
      WHERE h.id = household_favorite_tasks.household_id AND h.owner = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.participants p
      WHERE p.household_id = household_favorite_tasks.household_id AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.households h
      WHERE h.id = household_favorite_tasks.household_id AND h.owner = auth.uid()
    )
  );

CREATE POLICY "v3_favorites_delete"
  ON public.household_favorite_tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.participants p
      WHERE p.household_id = household_favorite_tasks.household_id AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.households h
      WHERE h.id = household_favorite_tasks.household_id AND h.owner = auth.uid()
    )
  );

-- task_declarations
ALTER TABLE public.task_declarations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "v3_declarations_select" ON public.task_declarations;
DROP POLICY IF EXISTS "v3_declarations_insert" ON public.task_declarations;
DROP POLICY IF EXISTS "v3_declarations_update" ON public.task_declarations;
DROP POLICY IF EXISTS "v3_declarations_delete" ON public.task_declarations;

CREATE POLICY "v3_declarations_select"
  ON public.task_declarations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.participants p
      WHERE p.household_id = task_declarations.household_id AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.households h
      WHERE h.id = task_declarations.household_id AND h.owner = auth.uid()
    )
  );

CREATE POLICY "v3_declarations_insert"
  ON public.task_declarations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.participants p
      WHERE p.household_id = task_declarations.household_id AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.households h
      WHERE h.id = task_declarations.household_id AND h.owner = auth.uid()
    )
  );

CREATE POLICY "v3_declarations_update"
  ON public.task_declarations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.participants p
      WHERE p.household_id = task_declarations.household_id AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.households h
      WHERE h.id = task_declarations.household_id AND h.owner = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.participants p
      WHERE p.household_id = task_declarations.household_id AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.households h
      WHERE h.id = task_declarations.household_id AND h.owner = auth.uid()
    )
  );

CREATE POLICY "v3_declarations_delete"
  ON public.task_declarations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.participants p
      WHERE p.household_id = task_declarations.household_id AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.households h
      WHERE h.id = task_declarations.household_id AND h.owner = auth.uid()
    )
  );

-- task_declaration_performers (via déclaration -> foyer)
ALTER TABLE public.task_declaration_performers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "v3_tdp_select" ON public.task_declaration_performers;
DROP POLICY IF EXISTS "v3_tdp_insert" ON public.task_declaration_performers;
DROP POLICY IF EXISTS "v3_tdp_update" ON public.task_declaration_performers;
DROP POLICY IF EXISTS "v3_tdp_delete" ON public.task_declaration_performers;

CREATE POLICY "v3_tdp_select"
  ON public.task_declaration_performers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.task_declarations d
      JOIN public.participants p ON p.household_id = d.household_id AND p.user_id = auth.uid()
      WHERE d.id = task_declaration_performers.declaration_id
    )
    OR EXISTS (
      SELECT 1 FROM public.task_declarations d
      JOIN public.households h ON h.id = d.household_id AND h.owner = auth.uid()
      WHERE d.id = task_declaration_performers.declaration_id
    )
  );

CREATE POLICY "v3_tdp_insert"
  ON public.task_declaration_performers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.task_declarations d
      JOIN public.participants p ON p.household_id = d.household_id AND p.user_id = auth.uid()
      WHERE d.id = task_declaration_performers.declaration_id
    )
    OR EXISTS (
      SELECT 1 FROM public.task_declarations d
      JOIN public.households h ON h.id = d.household_id AND h.owner = auth.uid()
      WHERE d.id = task_declaration_performers.declaration_id
    )
  );

CREATE POLICY "v3_tdp_update"
  ON public.task_declaration_performers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.task_declarations d
      JOIN public.participants p ON p.household_id = d.household_id AND p.user_id = auth.uid()
      WHERE d.id = task_declaration_performers.declaration_id
    )
    OR EXISTS (
      SELECT 1 FROM public.task_declarations d
      JOIN public.households h ON h.id = d.household_id AND h.owner = auth.uid()
      WHERE d.id = task_declaration_performers.declaration_id
    )
  );

CREATE POLICY "v3_tdp_delete"
  ON public.task_declaration_performers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.task_declarations d
      JOIN public.participants p ON p.household_id = d.household_id AND p.user_id = auth.uid()
      WHERE d.id = task_declaration_performers.declaration_id
    )
    OR EXISTS (
      SELECT 1 FROM public.task_declarations d
      JOIN public.households h ON h.id = d.household_id AND h.owner = auth.uid()
      WHERE d.id = task_declaration_performers.declaration_id
    )
  );

-- task_declaration_thinkers
ALTER TABLE public.task_declaration_thinkers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "v3_tdt_select" ON public.task_declaration_thinkers;
DROP POLICY IF EXISTS "v3_tdt_insert" ON public.task_declaration_thinkers;
DROP POLICY IF EXISTS "v3_tdt_update" ON public.task_declaration_thinkers;
DROP POLICY IF EXISTS "v3_tdt_delete" ON public.task_declaration_thinkers;

CREATE POLICY "v3_tdt_select"
  ON public.task_declaration_thinkers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.task_declarations d
      JOIN public.participants p ON p.household_id = d.household_id AND p.user_id = auth.uid()
      WHERE d.id = task_declaration_thinkers.declaration_id
    )
    OR EXISTS (
      SELECT 1 FROM public.task_declarations d
      JOIN public.households h ON h.id = d.household_id AND h.owner = auth.uid()
      WHERE d.id = task_declaration_thinkers.declaration_id
    )
  );

CREATE POLICY "v3_tdt_insert"
  ON public.task_declaration_thinkers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.task_declarations d
      JOIN public.participants p ON p.household_id = d.household_id AND p.user_id = auth.uid()
      WHERE d.id = task_declaration_thinkers.declaration_id
    )
    OR EXISTS (
      SELECT 1 FROM public.task_declarations d
      JOIN public.households h ON h.id = d.household_id AND h.owner = auth.uid()
      WHERE d.id = task_declaration_thinkers.declaration_id
    )
  );

CREATE POLICY "v3_tdt_update"
  ON public.task_declaration_thinkers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.task_declarations d
      JOIN public.participants p ON p.household_id = d.household_id AND p.user_id = auth.uid()
      WHERE d.id = task_declaration_thinkers.declaration_id
    )
    OR EXISTS (
      SELECT 1 FROM public.task_declarations d
      JOIN public.households h ON h.id = d.household_id AND h.owner = auth.uid()
      WHERE d.id = task_declaration_thinkers.declaration_id
    )
  );

CREATE POLICY "v3_tdt_delete"
  ON public.task_declaration_thinkers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.task_declarations d
      JOIN public.participants p ON p.household_id = d.household_id AND p.user_id = auth.uid()
      WHERE d.id = task_declaration_thinkers.declaration_id
    )
    OR EXISTS (
      SELECT 1 FROM public.task_declarations d
      JOIN public.households h ON h.id = d.household_id AND h.owner = auth.uid()
      WHERE d.id = task_declaration_thinkers.declaration_id
    )
  );

-- Les participants référencés doivent appartenir au même foyer que la déclaration :
-- (optionnel, renforcé côté app ; contrainte SQL possible en trigger — omis ici pour simplicité)
