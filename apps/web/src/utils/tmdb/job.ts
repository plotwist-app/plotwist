import type { Dictionary } from '../dictionaries'

export function getJobLabel(dictionary: Dictionary, job: string) {
  const label: Record<string, string> = {
    Actor: dictionary.actor,
    'Executive Producer': dictionary.executive_producer,
    Musician: dictionary.musician,
    Director: dictionary.director,
    Writer: dictionary.writer,
    Novel: dictionary.novel,
    'Audio Post Coordinator': dictionary.audio_post_coordinator,
    Producer: dictionary.producer,
    Screenplay: dictionary.screenplay,
    'Original Series Creator': dictionary.original_series_creator,
    Creator: dictionary.creator,
    'Comic Book': dictionary.comic_book,
    Characters: dictionary.characters,
    Thanks: dictionary.thanks,
    'In Memory Of': dictionary.in_memory_of,
    'Original Film Writer': dictionary.original_film_writer,
    'Co-Executive Producer': dictionary.co_executive_producer,
    Presenter: dictionary.presenter,
    'Script Consultant': dictionary.script_consultant,
    'Consulting Producer': dictionary.consulting_producer,
    Story: dictionary.story,
    'Executive Story Editor': dictionary.executive_story_editor,
    'Creative Consultant': dictionary.creative_consultant,
    'Supervising Producer': dictionary.supervising_producer,
    'Story Editor': dictionary.story_editor,
    'Costume Design': dictionary.costume_design,
    'Production Design': dictionary.production_design,
    Editor: dictionary.editor,
  }

  return label[job] || job
}
