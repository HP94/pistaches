# Mise à jour Supabase - Guide étape par étape

## 📋 Résumé des changements

Vous avez convenu de :
1. **Structure** : `assignments` → `tasks` → `task_templates` (pas de `task_template_id` dans assignments)
2. **Points personnalisables** : Stockés dans la table `tasks` (pas dans `assignments`)
3. **Analytics** : Calculées directement dans Supabase via une vue SQL

## ✅ Fichiers SQL à exécuter (dans l'ordre)

### 1. Migration multi-household (si pas déjà fait)
**Fichier** : `supabase_migration_household_participants.sql`
- Ajoute `invitation_code` à `households`
- Ajoute `user_id` à `participants`
- Crée les indexes nécessaires

### 2. RLS Policies - Households
**Fichier** : `supabase_fix_household_rls.sql`
- Permet aux utilisateurs authentifiés de lire les households (pour rejoindre par code)
- Permet aux propriétaires de gérer leurs households

### 3. RLS Policies - Participants
**Fichier** : `supabase_fix_participants_rls_no_recursion.sql`
- Permet la lecture des participants dans les foyers
- Permet l'insertion de participants (propriétaire ou création de son propre participant)
- Évite la récursion infinie dans les policies

### 4. Setup Tasks & Analytics
**Fichier** : `supabase_tasks_analytics_setup_corrected.sql`
- Ajoute `performer_points` et `mental_load_points` à la table `tasks`
- Crée la fonction `get_task_points()` pour obtenir les points effectifs
- Crée la vue `task_template_analytics` pour les analytics
- Crée la fonction `get_task_template_averages()` pour une tâche spécifique

## 🚀 Étapes d'exécution

1. **Ouvrez Supabase Dashboard** → Votre projet "Equal Housing"
2. **Allez dans SQL Editor**
3. **Exécutez chaque fichier SQL dans l'ordre** (copiez-collez le contenu et cliquez sur "Run")

## 📊 Utilisation des Analytics

Après avoir exécuté le script, vous pouvez utiliser les analytics directement dans Supabase SQL Editor :

```sql
-- Voir toutes les moyennes par template de tâche
SELECT * FROM task_template_analytics 
ORDER BY avg_performer_points DESC;

-- Voir les moyennes pour une tâche spécifique
SELECT * FROM get_task_template_averages('uuid-du-template-ici');

-- Filtrer par catégorie
SELECT * FROM task_template_analytics 
WHERE category = 'cleaning'
ORDER BY avg_performer_points DESC;
```

## 📝 Notes importantes

- Les points dans `tasks` sont NULL par défaut → utilise les valeurs du template
- Quand un participant modifie les points d'une tâche, tous les assignments utilisent ces nouveaux points
- Pour une même tâche, différents assignments peuvent avoir des `performer_id` et `responsible_id` différents
- Les analytics calculent les moyennes à partir des tâches (pas des assignments)

