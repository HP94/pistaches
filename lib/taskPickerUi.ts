import { translateCategory, translateTaskName } from '@/lib/translations'
import type { TaskCategory, TaskTemplate } from '@/lib/supabase/taskTemplates'

export const PERFORMER_NAME_CLASS = 'text-[#93C572] font-medium'
export const THINKER_NAME_CLASS = 'text-[#8B5CF6] font-medium'
export const PERFORMER_POINTS_CLASS = 'text-[#93C572]'
export const THINKER_POINTS_CLASS = 'text-[#8B5CF6]'

export const ALL_TASK_CATEGORIES: TaskCategory[] = [
  'administrative',
  'car_maintenance',
  'cleaning',
  'cooking',
  'diy',
  'laundry',
  'other',
  'parenting',
  'pet_care',
  'shopping',
  'travel',
]

/** Tri alphabétique FR ; la catégorie « Autre » est toujours en dernier. */
export function sortCategoriesAlphabeticalFr(categories: TaskCategory[]): TaskCategory[] {
  const rest = categories.filter((c) => c !== 'other')
  const sorted: TaskCategory[] = [...rest].sort((a, b) =>
    translateCategory(a).localeCompare(translateCategory(b), 'fr')
  )
  if (categories.includes('other')) sorted.push('other')
  return sorted
}

export const TASK_CATEGORIES_ALPHABETICAL_FR = sortCategoriesAlphabeticalFr(ALL_TASK_CATEGORIES)

/** Catégories présentes dans les templates, triées par libellé FR. */
export function categoriesFromTemplates(templates: Pick<TaskTemplate, 'category'>[]): TaskCategory[] {
  const set = new Set<TaskCategory>()
  for (const t of templates) {
    set.add(t.category as TaskCategory)
  }
  return sortCategoriesAlphabeticalFr([...set])
}

export type TemplateCategoryGroup = {
  category: TaskCategory
  tasks: TaskTemplate[]
}

export function groupTemplatesByCategory(
  templates: TaskTemplate[],
  filterCategories?: Set<TaskCategory>
): TemplateCategoryGroup[] {
  const filtered =
    filterCategories && filterCategories.size > 0
      ? templates.filter((t) => filterCategories.has(t.category as TaskCategory))
      : templates

  const byCat = new Map<TaskCategory, TaskTemplate[]>()
  for (const t of filtered) {
    const c = t.category as TaskCategory
    const list = byCat.get(c) ?? []
    list.push(t)
    byCat.set(c, list)
  }

  return categoriesFromTemplates(filtered).map((category) => ({
    category,
    tasks: (byCat.get(category) ?? []).sort((a, b) =>
      translateTaskName(a.name).localeCompare(translateTaskName(b.name), 'fr')
    ),
  }))
}

export const CATEGORY_EMOJIS: Record<TaskCategory, string> = {
  administrative: '🧾',
  car_maintenance: '🚗',
  cleaning: '🧹',
  cooking: '🍳',
  diy: '🛠️',
  laundry: '🧺',
  other: '✨',
  parenting: '👨‍👩‍👧',
  pet_care: '🐾',
  shopping: '🛍️',
  travel: '🧳',
}
