// Translation mappings for task names and categories
// Database stores English, front-end displays French

export const taskTranslations: Record<string, string> = {
  // CLEANING TASKS
  'Dishes (washing)': 'Vaisselle (lavage)',
  'Dishes (loading/unloading dishwasher)': 'Vaisselle (charger/décharger le lave-vaisselle)',
  'Vacuuming': 'Aspirateur',
  'Mopping floors': 'Lavage du sol',
  'Cleaning bathrooms': 'Nettoyage des salles de bain',
  'Cleaning kitchen surfaces': 'Nettoyage des surfaces de la cuisine',
  'Dusting': 'Dépoussiérage',
  'Cleaning windows': 'Nettoyage des fenêtres',
  'Taking out trash': 'Sortir les poubelles',
  'Cleaning refrigerator': 'Nettoyage du réfrigérateur',
  'Cleaning oven': 'Nettoyage du four',
  'Organizing common areas': 'Organisation des espaces communs',
  'Deep cleaning (spring cleaning)': 'Grand ménage',

  // COOKING TASKS
  'Meal planning': 'Planification des repas',
  'Grocery shopping for meals': 'Courses alimentaires',
  'Cooking breakfast': 'Préparation du petit-déjeuner',
  'Cooking lunch': 'Préparation du déjeuner',
  'Cooking dinner': 'Préparation du dîner',
  'Meal prep (batch cooking)': 'Préparation de repas (batch cooking)',
  'Setting the table': 'Mettre la table',
  'Clearing the table': 'Débarrasser la table',
  'Packing lunches': 'Préparation des repas à emporter',

  // CHILDCARE TASKS
  'Morning routine with kids': 'Routine matinale avec les enfants',
  'Bedtime routine with kids': 'Routine du coucher avec les enfants',
  'Helping with homework': 'Aide aux devoirs',
  'School drop-off': 'Déposer à l\'école',
  'School pick-up': 'Récupérer à l\'école',
  'Organizing kids activities': 'Organisation des activités des enfants',
  'Bathing children': 'Donner le bain aux enfants',
  'Feeding children': 'Nourrir les enfants',
  'Playing with children': 'Jouer avec les enfants',
  'Managing kids appointments': 'Gestion des rendez-vous des enfants',

  // LAUNDRY TASKS
  'Doing laundry': 'Faire la lessive',
  'Folding laundry': 'Plier le linge',
  'Putting away laundry': 'Ranger le linge',
  'Ironing': 'Repassage',
  'Changing bed sheets': 'Changer les draps',

  // SHOPPING TASKS
  'Grocery shopping (general)': 'Courses alimentaires (général)',
  'Shopping for household items': 'Achats d\'articles ménagers',
  'Shopping for personal items': 'Achats d\'articles personnels',
  'Comparing prices / finding deals': 'Comparer les prix / trouver des bonnes affaires',

  // CAR MAINTENANCE TASKS
  'Car maintenance / oil change': 'Entretien de la voiture / vidange',
  'Car cleaning (interior)': 'Nettoyage de la voiture (intérieur)',
  'Car cleaning (exterior)': 'Nettoyage de la voiture (extérieur)',
  'Filling up gas tank': 'Faire le plein',
  'Car inspection / registration': 'Contrôle technique / immatriculation',

  // DIY TASKS
  'Home repairs': 'Réparations à la maison',
  'Furniture assembly': 'Montage de meubles',
  'Painting / touch-ups': 'Peinture / retouches',
  'Garden maintenance': 'Entretien du jardin',
  'Yard work': 'Travaux de jardinage',
  'Changing light bulbs': 'Changer les ampoules',
  'Fixing broken items': 'Réparer les objets cassés',

  // ADMINISTRATIVE TASKS
  'Paying bills': 'Payer les factures',
  'Managing household budget': 'Gestion du budget du foyer',
  'Scheduling appointments': 'Prise de rendez-vous',
  'Managing insurance': 'Gestion des assurances',
  'Tax preparation': 'Préparation des impôts',
  'Organizing documents': 'Organisation des documents',
  'Coordinating household services': 'Coordination des services du foyer',
  'Managing subscriptions': 'Gestion des abonnements',

  // OTHER TASKS
  'Pet care (feeding)': 'Soins aux animaux (nourriture)',
  'Pet care (walking)': 'Soins aux animaux (promenade)',
  'Pet care (vet appointments)': 'Soins aux animaux (rendez-vous vétérinaire)',
  'Watering plants': 'Arrosage des plantes',
  'Receiving packages': 'Réception de colis',
  'Managing mail': 'Gestion du courrier',
  'Hosting guests': 'Recevoir des invités',
  'Planning family events': 'Organisation d\'événements familiaux',
}

export const categoryTranslations: Record<string, string> = {
  cleaning: 'Nettoyage',
  cooking: 'Cuisine',
  childcare: 'Garde d\'enfants',
  laundry: 'Lessive',
  shopping: 'Courses',
  car_maintenance: 'Entretien automobile',
  diy: 'Bricolage',
  administrative: 'Administratif',
  other: 'Autre',
}

export const genderTranslations: Record<string, string> = {
  male: 'Homme',
  female: 'Femme',
  neutral: 'Neutre',
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

