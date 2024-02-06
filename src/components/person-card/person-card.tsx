import { Person } from '@/services/tmdb/requests/person/popular'
import { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'
import Image from 'next/image'
import Link from 'next/link'

type PersonCardProps = { person: Person; language: Language }

export const PersonCard = ({ person, language }: PersonCardProps) => {
  const { id, profile_path: profilePath, name, known_for: knownFor } = person

  const credits = knownFor.map((item) => item.name ?? item.title).join(', ')

  return (
    <Link
      href={`/${language}/app/people/${id}`}
      className="w-full cursor-pointer space-y-2"
      data-testid="movie-card"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md border bg-background/50 shadow">
        <Image
          fill
          className="object-cover"
          src={tmdbImage(profilePath, 'w500')}
          alt={name}
          sizes="100%"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-1">
          <span className="">{name}</span>
        </div>

        <p className="line-clamp-3 text-xs text-muted-foreground">{credits}</p>
      </div>
    </Link>
  )
}
