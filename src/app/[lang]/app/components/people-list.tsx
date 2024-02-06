import { PersonCard } from '@/components/person-card'
import { tmdb } from '@/services/tmdb'
import { Language } from '@/types/languages'

type PeopleListProps = { language: Language }

export const PeopleList = async ({ language }: PeopleListProps) => {
  const { results } = await tmdb.person.popular(language)

  return (
    <div className="grid grid-cols-4 gap-x-4 gap-y-8">
      {results.map((person) => (
        <PersonCard person={person} key={person.id} language={language} />
      ))}
    </div>
  )
}
