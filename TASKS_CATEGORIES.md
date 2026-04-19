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
- **Nom FR** : Linge

### shopping
- **Nom FR** : Achats

### car_maintenance
- **Nom FR** : Entretien automobile

### diy
- **Nom FR** : Bricolage/Jardin

### administrative
- **Nom FR** : Administratif

### pet_care
- **Nom FR** : Animaux domestiques

### travel
- **Nom FR** : Voyages/Week-end


### other
- **Nom FR** : Autre

---

## Tâches par catégorie

### cleaning (Nettoyage)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Dishes (washing) | Faire la Vaisselle | 20 | 0 |
| Loading/unloading dishwasher | Remplir/Vider le lave-vaisselle | 10 | 0 |
| Vacuuming | Passer l'Aspirateur | 30 | 0 |
| Mopping floors | Laver le sol | 30 | 0 |
| Cleaning bathrooms | Nettoyer la salle de bain | 40 | 10 |
| Cleaning toilets | Nettoyer les toilettes | 40 | 10 |
| Cleaning kitchen | Nettoyer la cuisine | 20 | 0 |
| Dusting | Dépoussiérage | 20 | 0 |
| Cleaning windows | Nettoyer les fenêtres | 30 | 10 |
| Taking out trash | Sortir les poubelles | 10 | 10 |
| Cleaning refrigerator | Nettoyer le réfrigérateur | 40 | 0 |
| Cleaning oven | Nettoyer le four | 50 | 0 |

### cooking (Cuisine)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Meal planning | Planifier les repas | 20 | 50 |
| Grocery shopping for meals | Faire les courses | 30 | 20 |
| Cooking breakfast | Préparer le petit-déjeuner | 20 | 0 |
| Cooking Meals | Préparer les repas | 30 | 0 |
| Setting the table | Mettre/Débarrasser la table | 10 | 0 |

### parenting (Parentalité)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Helping with homework | Aide aux devoirs | 30 | 20 |
| School drop-off | Déposer à l'école | 20 | 10 |
| School pick-up | Récupérer à l'école | 20 | 10 |
| Organizing kids activities | Organiser les activités des enfants | 30 | 40 |
| Bathing children | Donner le bain | 30 | 0 |
| Feeding children | Nourrir les enfants | 20 | 10 |
| Playing with children | Jouer avec les enfants | 30 | 0 |
| Managing kids appointments | Gérer les rendez-vous des enfants | 20 | 50 |
| Wake up kids | Réveiller les enfants | 40 | 20 |
| Dress the kids | Habiller les enfants | 40 | 20 |
| Read a story | Lire une histoire | 40 | 20 |
| Change diapers | Changer les couches | 40 | 20 |
| Night baby care | Se réveiller la nuit | 60 | 0 |
| Buy clothes | Acheter les vêtements | 30 | 20 |
| Take them to activities | Amener aux activités | 20 | 10 |
| Pick them up from activities | Récupérer des activités | 20 | 10 |


### laundry (Linge)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Doing laundry | Faire la lessive | 30 | 10 |
| Folding laundry | Plier le linge | 30 | 10 |
| Putting away laundry | Ranger le linge | 20 | 10 |
| Hang out the laundry | Étendre le linge | 30 | 10 |
| Take the laundry down | Ramasser le linge | 20 | 10 |
| Ironing | Repassage | 40 | 10 |
| Changing bed sheets / towels | Changer les draps/Serviette | 20 | 10 |

### shopping (Achats)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Shopping for household items | Achats pour la maison | 30 | 20 |
| Comparing prices / finding deals | Comparer les prix / trouver des bonnes affaires | 20 | 30 |

### car_maintenance (Entretien automobile)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Car maintenance / oil change | Réparation de la voiture / vidange | 20 | 20 |
| Car cleaning (interior) | Nettoyage de la voiture (intérieur) | 30 | 0 |
| Car cleaning (exterior) | Nettoyage de la voiture (extérieur) | 30 | 0 |
| Filling up gas tank | Faire le plein | 10 | 0 |
| Car inspection / registration | Contrôle technique | 20 | 20 |

### diy (Bricolage/Jardin)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Furniture assembly | Monter les meubles | 20 | 10 |
| Painting / repairs | Peinture / Réparation | 40 | 10 |
| Garden maintenance | Entretien du jardin | 40 | 10 |
| Upkeep / DIY | Entretien / Bricolage | 40 | 20 |

### administrative (Administratif)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Paying bills | Payer les factures | 20 | 30 |
| Managing household budget | Gérer le budget | 30 | 50 |
| Managing insurance | Gérer les assurances | 30 | 50 |
| Tax Managing | Gérer les impôts | 50 | 60 |
| Organizing documents | Organiser les documents | 30 | 40 |
| Managing subscriptions | Gérer les abonnements | 20 | 30 |


### pet_care (Animaux domestiques)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Feeding pet | Nourrir les animaux | 20 | 10 |
| Walking pet | Promener les animaux | 20 | 0 |
| Vet appointments | Rendez-vous vétérinaire | 20 | 30 |
| Clean the litter box | Nettoyer la litière | 20 | 30 |

### travel (Voyages/Week-end)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Plan trips | Organiser les voyages | 30 | 30 |
| Plan weekends | Organiser les week-ends | 40 | 50 |


### other (Autre)

| name_en | name_fr | default_points | default_mental_load_points |
|---------|---------|----------------|---------------------------|
| Watering plants | Arroser les plantes | 10 | 0 |
| Receiving packages | Réceptionner les colis | 10 | 0 |
| Planning family events | Organiser les événements familiaux | 30 | 60 |

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

