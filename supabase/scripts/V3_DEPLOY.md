# Déploiement v3 (Supabase)

Sur un projet **existant** (prod : `task_templates.id` en **integer**), exécuter dans l’éditeur SQL **dans cet ordre** :

1. [`supabase_v3_favorites_declarations.sql`](./supabase_v3_favorites_declarations.sql) — tables + colonne + fonction RPC
2. [`supabase_v3_favorites_declarations_rls.sql`](./supabase_v3_favorites_declarations_rls.sql) — RLS

Les bases créées avec [`../baseline_fresh_project.sql`](../baseline_fresh_project.sql) après cette version incluent déjà les tables v3 ; il reste à exécuter le script RLS **J** indiqué en fin de baseline.

## Coupure / données legacy

L’app v3 s’appuie sur `household_favorite_tasks` et `task_declarations`. Les écrans ne consomment plus les anciennes assignations pour l’équilibre ni pour la page Tâches.

- **Reset acceptable** : vider `assignments`, `tasks`, ou repartir d’un projet Supabase neuf + baseline + seeds.
- **Conserver l’historique** : écrire un script de migration personnalisé (non fourni ici) qui transforme d’anciennes lignes en `task_declarations` + liaisons — dépend de vos règles métier (dates, multi-participants).
