-- Retrait du modèle « Changing light bulbs » (retiré de TASKS_CATEGORIES.md).
-- Exécuter dans Supabase SQL Editor.
-- Ne supprime la ligne que si aucune tâche du foyer ne référence encore ce template.

DELETE FROM public.task_templates tt
WHERE tt.name = 'Changing light bulbs'
  AND NOT EXISTS (SELECT 1 FROM public.tasks t WHERE t.template_id = tt.id);
