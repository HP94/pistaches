/** Plage ISO YYYY-MM-DD valide pour les déclarations (from <= to). */
export function isValidDeclarationDateRange(from: string, to: string): boolean {
  return from <= to
}

/** Même contrat que Supabase .gte / .lte sur declared_on. */
export function isIsoDateInInclusiveRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to
}

export function filterDeclarationsByDateRange<T extends { declared_on: string }>(
  declarations: T[],
  from: string,
  to: string
): T[] {
  if (!isValidDeclarationDateRange(from, to)) return []
  return declarations.filter((d) => isIsoDateInInclusiveRange(d.declared_on, from, to))
}
