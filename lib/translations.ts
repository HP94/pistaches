// Translation mappings for task names and categories
// Database stores English, front-end displays French
// Source de vérité : TASKS_CATEGORIES.md

export const taskTranslations: Record<string, string> = {
  // Nettoyage
  'Dishes (washing)': 'Vaisselle (lavage)',
  'Loading/unloading dishwasher': 'Charger/décharger le lave-vaisselle',
  'Vacuuming': 'Passer l\'Aspirateur',
  'Mopping floors': 'Lavage du sol',
  'Cleaning bathrooms': 'Nettoyage salle de bain',
  'Cleaning toilets': 'Nettoyage toilettes',
  'Cleaning kitchen': 'Nettoyage cuisine',
  'Dusting': 'Dépoussiérage',
  'Cleaning windows': 'Nettoyage des fenêtres',
  'Taking out trash': 'Sortir les poubelles',
  'Cleaning refrigerator': 'Nettoyage du réfrigérateur',
  'Cleaning oven': 'Nettoyage du four',
  'Deep cleaning (spring cleaning)': 'Grand ménage',

  // Cuisine
  'Meal planning': 'Planification des repas',
  'Grocery shopping for meals': 'Courses alimentaires',
  'Cooking breakfast': 'Préparation du petit-déjeuner',
  'Cooking Meals': 'Préparation des repas',
  'Setting the table': 'Mettre la table',
  'Clearing the table': 'Débarrasser la table',

  // Parentalité
  'Morning routine with kids': 'Routine matinale',
  'Bedtime routine with kids': 'Routine du coucher',
  'Helping with homework': 'Aide aux devoirs',
  'School drop-off': 'Déposer à l\'école',
  'School pick-up': 'Récupérer à l\'école',
  'Organizing kids activities': 'Organisation des activités des enfants',
  'Bathing children': 'Donner le bain aux enfants',
  'Feeding children': 'Nourrir les enfants',
  'Playing with children': 'Jouer avec les enfants',
  'Managing kids appointments': 'Gestion des rendez-vous des enfants',

  // Lessive
  'Doing laundry': 'Faire la lessive',
  'Folding laundry': 'Plier le linge',
  'Putting away laundry': 'Ranger le linge',
  'Hang out the laundry': 'Étendre le linge',
  'Take the laundry down': 'Ramasser le linge',
  'Ironing': 'Repassage',
  'Changing bed sheets': 'Changer les draps',

  // Courses
  'Grocery shopping (general)': 'Courses alimentaires (général)',
  'Shopping for household items': 'Achats d\'articles ménagers',
  'Comparing prices / finding deals': 'Comparer les prix / trouver des bonnes affaires',

  // Entretien automobile
  'Car maintenance / oil change': 'Entretien de la voiture / vidange',
  'Car cleaning (interior)': 'Nettoyage de la voiture (intérieur)',
  'Car cleaning (exterior)': 'Nettoyage de la voiture (extérieur)',
  'Filling up gas tank': 'Faire le plein',
  'Car inspection / registration': 'Contrôle technique / immatriculation',

  // Bricolage
  'Home repairs': 'Réparations à la maison',
  'Furniture assembly': 'Montage de meubles',
  'Painting / touch-ups': 'Peinture / retouches',
  'Garden maintenance': 'Entretien du jardin',
  'Yard work': 'Travaux de jardinage',
  'Changing light bulbs': 'Changer les ampoules',
  'Fixing broken items': 'Réparer les objets cassés',

  // Administratif
  'Paying bills': 'Payer les factures',
  'Managing household budget': 'Gestion du budget du foyer',
  'Scheduling appointments': 'Prise de rendez-vous',
  'Managing insurance': 'Gestion des assurances',
  'Tax Managing': 'Gestion des impôts',
  'Organizing documents': 'Organisation des documents',
  'Managing subscriptions': 'Gestion des abonnements',

  // Autre
  'Feeding pet': 'Nourrir les animaux',
  'Walking pet': 'Promener les animaux',
  'Vet appointments': 'Rendez-vous vétérinaire',
  'Watering plants': 'Arrosage des plantes',
  'Receiving packages': 'Réception de colis',
  'Managing mail': 'Gestion du courrier',
  'Planning family events': 'Organisation d\'événements familiaux',

  // Anciens noms (rétrocompatibilité)
  'Dishes (loading/unloading dishwasher)': 'Charger/décharger le lave-vaisselle',
  'Cleaning kitchen surfaces': 'Nettoyage cuisine',
  'Tax preparation': 'Gestion des impôts',
  'Pet care (feeding)': 'Nourrir les animaux',
  'Pet care (walking)': 'Promener les animaux',
  'Pet care (vet appointments)': 'Rendez-vous vétérinaire',
  'Organizing common areas': 'Organisation des espaces communs',
  'Cooking lunch': 'Préparation du déjeuner',
  'Cooking dinner': 'Préparation du dîner',
  'Meal prep (batch cooking)': 'Préparation de repas (batch)',
  'Packing lunches': 'Préparation des repas à emporter',
  'Coordinating household services': 'Coordination des services du foyer',
  'Hosting guests': 'Recevoir des invités',
  'Shopping for personal items': 'Achats d\'articles personnels',
}

export const categoryTranslations: Record<string, string> = {
  administrative: 'Administratif',
  car_maintenance: 'Entretien automobile',
  parenting: 'Parentalité',
  cleaning: 'Nettoyage',
  cooking: 'Cuisine',
  diy: 'Bricolage',
  laundry: 'Lessive',
  other: 'Autre',
  shopping: 'Courses',
  childcare: 'Parentalité', // rétrocompatibilité
}

export const genderTranslations: Record<string, string> = {
  male: 'Homme',
  female: 'Femme',
  neutral: 'Autre',
}

/**
 * Translate a task name from English (DB) to French (UI)
 */
export function translateTaskName(englishName: string): string {
  return taskTranslations[englishName] || englishName
}

/**
 * Translate a category from English (DB) to French (UI)
 */
export function translateCategory(category: string): string {
  return categoryTranslations[category] || category
}

/**
 * Translate a gender value from English (DB) to French (UI)
 */
export function translateGender(gender: string): string {
  return genderTranslations[gender] || gender
}
