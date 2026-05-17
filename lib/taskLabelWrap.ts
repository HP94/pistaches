/** Découpe un libellé en lignes (~maxCharsPerLine), sans couper les mots. */
export function wrapLabelByWords(text: string, maxCharsPerLine = 20): string[] {
  const trimmed = text.trim()
  if (!trimmed) return ['']

  const words = trimmed.split(/\s+/)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    if (word.length > maxCharsPerLine) {
      if (current) {
        lines.push(current)
        current = ''
      }
      lines.push(word)
      continue
    }

    const next = current ? `${current} ${word}` : word
    if (next.length <= maxCharsPerLine) {
      current = next
    } else {
      if (current) lines.push(current)
      current = word
    }
  }

  if (current) lines.push(current)
  return lines.length > 0 ? lines : ['']
}
