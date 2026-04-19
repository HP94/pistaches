# Guide : Modifier les catégories et tâches dans Supabase

## Structure de la base de données

La table `task_templates` contient :
- `id` : Identifiant unique (UUID)
- `name` : Nom de la tâche (en anglais dans la DB)
- `category` : Catégorie (en anglais dans la DB)
- `default_points` : Points par défaut pour la réalisation (0-100)
- `default_mental_load_points` : Points par défaut pour la charge mentale (0-100)

## Comment modifier dans Supabase

### 1. Accéder à la table

1. Connectez-vous à votre projet Supabase
2. Allez dans **Table Editor** (menu de gauche)
3. Sélectionnez la table `task_templates`

### 2. Modifier une tâche existante

1. Cliquez sur la ligne de la tâche à modifier
2. Modifiez les champs :
   - `name` : Changez le nom (en anglais)
   - `category` : Changez la catégorie (voir catégories disponibles ci-dessous)
   - `default_points` : Ajustez les points (0-100, par pas de 10)
   - `default_mental_load_points` : Ajustez les points de charge mentale
3. Cliquez sur **Save** ou appuyez sur `Enter`

### 3. Créer une nouvelle tâche

1. Cliquez sur **Insert row** (ou le bouton +)
2. Remplissez les champs :
   - `name` : Nom de la tâche en anglais (ex: "New Task")
   - `category` : Une des catégories existantes ou une nouvelle (voir ci-dessous)
   - `default_points` : Points par défaut (ex: 30)
   - `default_mental_load_points` : Points charge mentale (ex: 10)
3. Cliquez sur **Save**

### 4. Créer une nouvelle catégorie

Les catégories sont simplement des valeurs textuelles dans la colonne `category`. Vous pouvez :
- Utiliser une catégorie existante : `cleaning`, `cooking`, `parenting`, `laundry`, `shopping`, `car_maintenance`, `diy`, `administrative`, `other`
- Créer une nouvelle catégorie : Utilisez un nom en anglais en minuscules avec underscores (ex: `garden_maintenance`, `pet_care`)

**Important** : Si vous créez une nouvelle catégorie, vous devrez aussi :
1. Mettre à jour le type `TaskCategory` dans `app/tasks/page.tsx` (ligne 12)
2. Ajouter la traduction dans `lib/translations.ts` (fonction `categoryTranslations`)

### 5. Supprimer une tâche

1. Cliquez sur la ligne de la tâche
2. Cliquez sur **Delete** (ou appuyez sur `Delete`)
3. Confirmez la suppression

⚠️ **Attention** : Si une tâche est déjà utilisée dans des foyers (table `tasks`), la suppression du template peut causer des problèmes. Il est préférable de ne pas supprimer les templates utilisés.

## Mettre à jour les traductions

Après avoir modifié ou créé des tâches/catégories dans Supabase, vous devez mettre à jour le fichier `lib/translations.ts` :

### Pour une nouvelle tâche :
Ajoutez dans `taskTranslations` :
```typescript
'New Task': 'Nouvelle Tâche',
```

### Pour une nouvelle catégorie :
1. Ajoutez dans `categoryTranslations` :
```typescript
new_category: 'Nouvelle Catégorie',
```

2. Mettez à jour le type `TaskCategory` dans `app/tasks/page.tsx` :
```typescript
type TaskCategory = 'cleaning' | 'cooking' | ... | 'new_category'
```

3. Ajoutez l'option dans le select de catégorie dans `app/tasks/page.tsx` (dans la modale d'ajout de tâche)

## Catégories existantes

- `cleaning` → "Nettoyage"
- `cooking` → "Cuisine"
- `parenting` → "Parentalité"
- `laundry` → "Linge"
- `shopping` → "Achats"
- `car_maintenance` → "Entretien automobile"
- `diy` → "Bricolage"
- `administrative` → "Administratif"
- `other` → "Autre"

## Exemple : Créer une nouvelle catégorie "Jardin"

1. **Dans Supabase** : Créez des tâches avec `category = 'garden'`
2. **Dans `app/tasks/page.tsx`** : Ajoutez `'garden'` au type `TaskCategory`
3. **Dans `lib/translations.ts`** : Ajoutez `garden: 'Jardin'` dans `categoryTranslations`
4. **Dans `app/tasks/page.tsx`** : Ajoutez l'option dans le select de catégorie

