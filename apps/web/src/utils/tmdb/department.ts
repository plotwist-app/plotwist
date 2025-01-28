import type { Dictionary } from '../dictionaries'

export function getDepartmentLabel(dictionary: Dictionary, department: string) {
  const label: Record<string, string> = {
    Directing: dictionary.directing,
    Acting: dictionary.acting,
    Production: dictionary.production,
    Writing: dictionary.writing,
    Camera: dictionary.camera,
    Editing: dictionary.editing,
    Sound: dictionary.sound,
    Art: dictionary.art,
    'Costume & Make-Up': dictionary.costume_and_make_up,
    'Visual Effects': dictionary.visual_effects,
    Crew: dictionary.crew,
    Lighting: dictionary.lighting,
  }

  return label[department] || department
}
