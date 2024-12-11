import type { Dictionary } from '../dictionaries'

export function getDepartamentLabel(
  dictionary: Dictionary,
  department: string
) {
  const label: Record<string, string> = {
    Directing: dictionary.directing,
    Acting: dictionary.acting,
  }

  return label[department] || department
}
