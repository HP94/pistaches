-- CORE #3 : restreindre UPDATE sur participants
-- - Chaque utilisateur ne modifie que sa propre ligne (user_id = auth.uid()).
-- - Le propriétaire du foyer modifie uniquement les membres sans compte (user_id IS NULL).
-- La politique "Allow claim orphan participant" reste ; les UPDATE sont permis si au moins une politique passe.
--
-- À exécuter dans Supabase SQL Editor.

DROP POLICY IF EXISTS "Allow update participants in household" ON public.participants;

CREATE POLICY "Allow update participants in household"
  ON public.participants
  FOR UPDATE
  USING (
    participants.user_id = auth.uid()
    OR (
      EXISTS (
        SELECT 1 FROM public.households
        WHERE households.id = participants.household_id
          AND households.owner = auth.uid()
      )
      AND participants.user_id IS NULL
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR (
      EXISTS (
        SELECT 1 FROM public.households
        WHERE households.id = participants.household_id
          AND households.owner = auth.uid()
      )
      AND user_id IS NULL
    )
  );
