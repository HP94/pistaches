# Tâches et Catégories - Source de vérité

Ce fichier est la source de vérité pour toutes les catégories et tâches de l'application.
Modifiez ce fichier pour mettre à jour les tâches, catégories et traductions.

## Format

Chaque catégorie est définie avec :
- `id` : Identifiant technique (en anglais, minuscules avec underscores)
- `name_fr` : Nom en français (affiché dans l'interface)

Chaque tâche est définie avec :
- `name_en` : Nom en anglais (stocké dans la DB)
- `name_fr` : Nom en français (traduction affichée)
- `default_points` : Points par défaut pour la réalisation (0-100)
- `default_mental_load_points` : Points par défaut pour la charge mentale (0-100)

---

## Catégories

### cleaning
- **Nom FR** : Nettoyage

### cooking
- **Nom FR** : Cuisine

### parenting
- **Nom FR** : Parentalité

### laundry
- **Nom FR** : Lessive

### shopping
- **Nom FR** : Courses

### car_maintenance
- **Nom FR** : Entretien automobile

### diy
- **Nom FR** : Bricolage

### administrative
- **Nom FR** : Administratif

### other
- **Nom FR** : Autre

---

## Tâches par catégorie

### cleaning (Nettoyage)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Dishes (washing) | Vaisselle (lavage) | 20 | 0 |
| Loading/unloading dishwasher | Charger/décharger le lave-vaisselle | 10 | 0 |
| Vacuuming | Passer l'Aspirateur | 30 | 0 |
| Mopping floors | Lavage du sol | 30 | 0 |
| Cleaning bathrooms | Nettoyage salle de bain | 40 | 10 |
| Cleaning toilets | Nettoyage toilettes | 40 | 10 |
| Cleaning kitchen | Nettoyage cuisine | 20 | 0 |
| Dusting | Dépoussiérage | 20 | 0 |
| Cleaning windows | Nettoyage des fenêtres | 30 | 0 |
| Taking out trash | Sortir les poubelles | 10 | 10 |
| Cleaning refrigerator | Nettoyage du réfrigérateur | 40 | 0 |
| Cleaning oven | Nettoyage du four | 50 | 0 |
| Deep cleaning (spring cleaning) | Grand ménage | 80 | 20 |

### cooking (Cuisine)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Meal planning | Planification des repas | 20 | 50 |
| Grocery shopping for meals | Courses alimentaires | 30 | 20 |
| Cooking breakfast | Préparation du petit-déjeuner | 20 | 0 |
| Cooking Meals | Préparation des repas | 30 | 0 |
| Setting the table | Mettre la table | 10 | 0 |
| Clearing the table | Débarrasser la table | 10 | 0 |

### parenting (Parentalité)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Morning routine with kids | Routine matinale | 40 | 20 |
| Bedtime routine with kids | Routine du coucher | 40 | 20 |
| Helping with homework | Aide aux devoirs | 30 | 20 |
| School drop-off | Déposer à l'école | 20 | 10 |
| School pick-up | Récupérer à l'école | 20 | 10 |
| Organizing kids activities | Organisation des activités des enfants | 30 | 40 |
| Bathing children | Donner le bain aux enfants | 30 | 0 |
| Feeding children | Nourrir les enfants | 20 | 10 |
| Playing with children | Jouer avec les enfants | 30 | 0 |
| Managing kids appointments | Gestion des rendez-vous des enfants | 20 | 50 |

### laundry (Lessive)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Doing laundry | Faire la lessive | 30 | 10 |
| Folding laundry | Plier le linge | 30 | 10 |
| Putting away laundry | Ranger le linge | 20 | 10 |
| Hang out the laundry | Étendre le linge | 30 | 10 |
| Take the laundry down | Ramasser le linge | 20 | 10 |
| Ironing | Repassage | 40 | 10 |
| Changing bed sheets | Changer les draps | 20 | 10 |

### shopping (Courses)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Grocery shopping (general) | Courses alimentaires (général) | 30 | 20 |
| Shopping for household items | Achats d'articles ménagers | 30 | 20 |
| Comparing prices / finding deals | Comparer les prix / trouver des bonnes affaires | 20 | 30 |

### car_maintenance (Entretien automobile)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Car maintenance / oil change | Entretien de la voiture / vidange | 40 | 20 |
| Car cleaning (interior) | Nettoyage de la voiture (intérieur) | 30 | 0 |
| Car cleaning (exterior) | Nettoyage de la voiture (extérieur) | 30 | 0 |
| Filling up gas tank | Faire le plein | 10 | 0 |
| Car inspection / registration | Contrôle technique / immatriculation | 30 | 30 |

### diy (Bricolage)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Home repairs | Réparations à la maison | 50 | 20 |
| Furniture assembly | Montage de meubles | 40 | 10 |
| Painting / touch-ups | Peinture / retouches | 40 | 10 |
| Garden maintenance | Entretien du jardin | 40 | 10 |
| Yard work | Travaux de jardinage | 50 | 0 |
| Changing light bulbs | Changer les ampoules | 10 | 0 |
| Fixing broken items | Réparer les objets cassés | 40 | 20 |

### administrative (Administratif)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Paying bills | Payer les factures | 20 | 30 |
| Managing household budget | Gestion du budget du foyer | 30 | 50 |
| Scheduling appointments | Prise de rendez-vous | 20 | 40 |
| Managing insurance | Gestion des assurances | 30 | 50 |
| Tax Managing | Gestion des impôts | 50 | 60 |
| Organizing documents | Organisation des documents | 30 | 40 |
| Managing subscriptions | Gestion des abonnements | 20 | 30 |

### other (Autre)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Feeding pet | Nourrir les animaux | 20 | 10 |
| Walking pet | Promener les animaux | 20 | 0 |
| Vet appointments | Rendez-vous vétérinaire | 20 | 30 |
| Watering plants | Arrosage des plantes | 10 | 0 |
| Receiving packages | Réception de colis | 10 | 0 |
| Managing mail | Gestion du courrier | 10 | 10 |
| Planning family events | Organisation d'événements familiaux | 30 | 60 |

---

## Instructions d'utilisation

### Pour ajouter une nouvelle catégorie :
1. Ajoutez la catégorie dans la section "Catégories" avec son `id` et `name_fr`
2. Créez une nouvelle section "### id_categorie (Nom FR)" dans "Tâches par catégorie"
3. Ajoutez les tâches de cette catégorie dans le tableau

### Pour ajouter une nouvelle tâche :
1. Trouvez la catégorie correspondante
2. Ajoutez une nouvelle ligne dans le tableau avec toutes les colonnes

### Pour modifier une tâche :
1. Modifiez directement la ligne dans le tableau correspondant

### Pour supprimer une tâche :
1. Supprimez la ligne du tableau

### Pour modifier une traduction :
1. Modifiez la colonne `name_fr` dans le tableau correspondant

---

## Notes

- Les `default_points` et `default_mental_load_points` doivent être entre 0 et 100
- Les valeurs sont généralement par pas de 10
- Les `name_en` doivent être uniques
- Les `id` de catégories doivent être en minuscules avec underscores (ex: `car_maintenance`)

