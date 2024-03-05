import {
  MovieWithMediaType,
  PersonWithMediaType,
  TvShowWithMediaType,
} from '@/services/tmdb/types'
import { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'
import Image from 'next/image'
import Link from 'next/link'
import { Skeleton } from '../ui/skeleton'

type CommandSearchItemProps<T> = { language: Language; item: T }

export const CommandSearchMovie = ({
  item,
  language,
}: CommandSearchItemProps<MovieWithMediaType>) => {
  return (
    <Link
      href={`/${language}/app/movies/${item.id}`}
      className="flex cursor-pointer items-center justify-between gap-4 rounded-sm px-2 py-1 hover:bg-muted"
    >
      <span className="text-md truncate whitespace-nowrap">{item.title}</span>

      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {item.release_date !== '' && new Date(item.release_date).getFullYear()}
      </span>
    </Link>
  )
}

export const CommandSearchTvShow = ({
  item,
  language,
}: CommandSearchItemProps<TvShowWithMediaType>) => {
  return (
    <Link
      className="flex cursor-pointer items-center justify-between gap-4 rounded-sm px-2 py-1 hover:bg-muted"
      href={`/${language}/app/tv-shows/${item.id}`}
    >
      <span className="text-md truncate whitespace-nowrap">{item.name}</span>

      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {item.first_air_date && new Date(item.first_air_date).getFullYear()}
      </span>
    </Link>
  )
}

export const CommandSearchPerson = ({
  item,
  language,
}: CommandSearchItemProps<PersonWithMediaType>) => {
  return (
    <Link
      className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted"
      href={`/${language}/app/people/${item.id}`}
    >
      <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-muted-foreground">
        {item.profile_path ? (
          <Image
            fill
            className="object-cover"
            src={tmdbImage(item.profile_path)}
            alt={item.name}
            loading="lazy"
            sizes="100%"
          />
        ) : (
          item.name[0]
        )}
      </div>

      <span className="text-sm">{item.name}</span>
    </Link>
  )
}

export const CommandSearchSkeleton = () => (
  <div className="flex items-center justify-between gap-4 rounded-sm px-2 py-1">
    <Skeleton className="h-[2ex] w-[20ch]" />
    <Skeleton className="h-[2ex] w-[4ch]" />
  </div>
)
