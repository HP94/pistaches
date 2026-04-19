-- ÉTAPE 1 / 2 — Exécuter CE SEUL script d’abord, puis valider (Run).
-- PostgreSQL : les nouvelles valeurs d’enum ne sont utilisables qu’après COMMIT
-- (erreur 55P04 si vous mélangez ADD VALUE et UPDATE/INSERT dans la même exécution).

ALTER TYPE public.task_category ADD VALUE IF NOT EXISTS 'pet_care';
ALTER TYPE public.task_category ADD VALUE IF NOT EXISTS 'travel';
