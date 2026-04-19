// Translation mappings for task names and categories
// Database stores English, front-end displays French
// Source de vérité : TASKS_CATEGORIES.md

export const taskTranslations: Record<string, string> = {
  // Nettoyage
  'Dishes (washing)': 'Faire la vaisselle',
  'Loading/unloading dishwasher': 'Remplir/Vider le lave-vaisselle',
  Vacuuming: 'Passer l’aspirateur',
  'Mopping floors': 'Laver le sol',
  'Cleaning bathrooms': 'Nettoyer la salle de bain',
  'Cleaning toilets': 'Nettoyer les toilettes',
  'Cleaning kitchen': 'Nettoyer la cuisine',
  Dusting: 'Dépoussiérage',
  'Cleaning windows': 'Nettoyer les fenêtres',
  'Taking out trash': 'Sortir les poubelles',
  'Cleaning refrigerator': 'Nettoyer le réfrigérateur',
  'Cleaning oven': 'Nettoyer le four',

  // Cuisine
  'Meal planning': 'Planifier les repas',
  'Grocery shopping for meals': 'Faire les courses',
  'Cooking breakfast': 'Préparer le petit-déjeuner',
  'Cooking Meals': 'Préparer les repas',
  'Setting the table': 'Mettre/Débarrasser la table',

  // Parentalité
  'Helping with homework': 'Aide aux devoirs',
  'School drop-off': 'Déposer à l’école',
  'School pick-up': 'Récupérer à l’école',
  'Organizing kids activities': 'Organiser les activités des enfants',
  'Bathing children': 'Donner le bain',
  'Feeding children': 'Nourrir les enfants',
  'Playing with children': 'Jouer avec les enfants',
  'Managing kids appointments': 'Gérer les rendez-vous des enfants',
  'Wake up kids': 'Réveiller les enfants',
  'Dress the kids': 'Habiller les enfants',
  'Read a story': 'Lire une histoire',
  'Change diapers': 'Changer les couches',
  'Night baby care': 'Se réveiller la nuit',
  'Buy clothes': 'Acheter les vêtements',
  'Take them to activities': 'Amener aux activités',
  'Pick them up from activities': 'Récupérer des activités',

  // Linge
  'Doing laundry': 'Faire la lessive',
  'Folding laundry': 'Plier le linge',
  'Putting away laundry': 'Ranger le linge',
  'Hang out the laundry': 'Étendre le linge',
  'Take the laundry down': 'Ramasser le linge',
  Ironing: 'Repassage',
  'Changing bed sheets / towels': 'Changer les draps/serviette',

  // Achats (catégorie shopping)
  'Shopping for household items': 'Achats pour la maison',
  'Comparing prices / finding deals': 'Comparer les prix / trouver des bonnes affaires',

  // Entretien automobile
  'Car maintenance / oil change': 'Réparation de la voiture / vidange',
  'Car cleaning (interior)': 'Nettoyage de la voiture (intérieur)',
  'Car cleaning (exterior)': 'Nettoyage de la voiture (extérieur)',
  'Filling up gas tank': 'Faire le plein',
  'Car inspection / registration': 'Contrôle technique',

  // Bricolage / jardin
  'Furniture assembly': 'Monter les meubles',
  'Painting / repairs': 'Peinture / réparation',
  'Garden maintenance': 'Entretien du jardin',
  'Upkeep / DIY': 'Entretien / bricolage',

  // Administratif
  'Paying bills': 'Payer les factures',
  'Managing household budget': 'Gérer le budget',
  'Managing insurance': 'Gérer les assurances',
  'Tax Managing': 'Gérer les impôts',
  'Organizing documents': 'Organiser les documents',
  'Managing subscriptions': 'Gérer les abonnements',

  // Animaux
  'Feeding pet': 'Nourrir les animaux',
  'Walking pet': 'Promener les animaux',
  'Vet appointments': 'Rendez-vous vétérinaire',
  'Clean the litter box': 'Nettoyer la litière',

  // Voyages
  'Plan trips': 'Organiser les voyages',
  'Plan weekends': 'Organiser les week-ends',

  // Autre
  'Watering plants': 'Arroser les plantes',
  'Receiving packages': 'Réceptionner les colis',
  'Planning family events': 'Organiser les événements familiaux',

  // Anciens noms (rétrocompatibilité jusqu’à migration SQL)
  'Dishes (loading/unloading dishwasher)': 'Remplir/Vider le lave-vaisselle',
  'Cleaning kitchen surfaces': 'Nettoyer la cuisine',
  'Tax preparation': 'Gérer les impôts',
  'Pet care (feeding)': 'Nourrir les animaux',
  'Pet care (walking)': 'Promener les animaux',
  'Pet care (vet appointments)': 'Rendez-vous vétérinaire',
  'Morning routine with kids': 'Routine matinale',
  'Bedtime routine with kids': 'Routine du coucher',
  'Organizing common areas': 'Organisation des espaces communs',
  'Deep cleaning (spring cleaning)': 'Grand ménage',
  'Cooking lunch': 'Préparation du déjeuner',
  'Cooking dinner': 'Préparation du dîner',
  'Meal prep (batch cooking)': 'Préparation de repas (batch)',
  'Clearing the table': 'Débarrasser la table',
  'Packing lunches': 'Préparation des repas à emporter',
  'Grocery shopping (general)': 'Courses alimentaires (général)',
  'Shopping for personal items': 'Achats d’articles personnels',
  'Home repairs': 'Réparations à la maison',
  'Painting / touch-ups': 'Peinture / réparation',
  'Yard work': 'Travaux de jardinage',
  'Fixing broken items': 'Réparer les objets cassés',
  'Scheduling appointments': 'Prise de rendez-vous',
  'Coordinating household services': 'Coordination des services du foyer',
  'Hosting guests': 'Recevoir des invités',
  'Managing mail': 'Gestion du courrier',
  'Changing bed sheets': 'Changer les draps/serviette',
}

export const categoryTranslations: Record<string, string> = {
  administrative: 'Administratif',
  car_maintenance: 'Entretien automobile',
  parenting: 'Parentalité',
  cleaning: 'Nettoyage',
  cooking: 'Cuisine',
  diy: 'Bricolage / jardin',
  laundry: 'Linge',
  other: 'Autre',
  shopping: 'Achats',
  pet_care: 'Animaux domestiques',
  travel: 'Voyages / week-end',
  childcare: 'Parentalité',
}

export const genderTranslations: Record<string, string> = {
  male: 'Homme',
  female: 'Femme',
  neutral: 'Autre',
}

export function translateTaskName(englishName: string): string {
  return taskTranslations[englishName] || englishName
}

export function translateCategory(category: string): string {
  return categoryTranslations[category] || category
}

export function translateGender(gender: string): string {
  return genderTranslations[gender] || gender
}
