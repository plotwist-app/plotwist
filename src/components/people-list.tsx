import { TMDB } from '@/services/TMDB'
import { TvShowCard } from './tv-show-card'
import { PersonCard } from './person-card'

type Variant = 'popular'

type PeopleListProps = {
  variant: Variant
}

export const PeopleList = async ({ variant }: PeopleListProps) => {
  const { results } = await TMDB.people[variant]()

  const title: Record<Variant, string> = {
    popular: 'Popular people',
  }

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-end">
        <div className="flex gap-2 items-center">
          <div className="h-3 w-3 bg-muted rounded-sm" />
          <h2 className="text-2xl font-bold">{title[variant]}</h2>
        </div>

        <span className="underline text-xs  cursor-pointer text-muted-foreground">
          Show all
        </span>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {results.slice(0, 5).map((person) => (
          <PersonCard person={person} key={person.id} />
        ))}
      </div>
    </section>
  )
}
