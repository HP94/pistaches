-- Permet à un utilisateur authentifié de « réclamer » un participant sans compte (user_id NULL)
-- en se liant à ce membre lors du flux « rejoindre un foyer » (finalizeJoinMerge).
-- À exécuter dans Supabase SQL Editor si la fusion échoue avec une erreur RLS.

DROP POLICY IF EXISTS "Allow claim orphan participant" ON public.participants;

CREATE POLICY "Allow claim orphan participant"
  ON public.participants
  FOR UPDATE
  USING (user_id IS NULL)
  WITH CHECK (user_id = auth.uid());
