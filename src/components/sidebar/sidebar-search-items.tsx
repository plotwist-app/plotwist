import {
  MovieWithMediaType,
  PersonWithMediaType,
  TvShowWithMediaType,
} from '@/services/tmdb/types'
import { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'
import Image from 'next/image'
import Link from 'next/link'

type SidebarSearchItemProps<T> = { language: Language; item: T }

export const SidebarSearchMovie = ({
  item,
  language,
}: SidebarSearchItemProps<MovieWithMediaType>) => {
  return (
    <Link
      href={`/${language}/app/movies/${item.id}`}
      className="flex cursor-pointer items-center justify-between gap-4 rounded-sm px-2 py-1 hover:bg-muted"
      key={item.id}
    >
      <span className="text-md truncate whitespace-nowrap">{item.title}</span>

      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {new Date(item.release_date).getFullYear()}
      </span>
    </Link>
  )
}

export const SidebarSearchTvShow = ({
  item,
  language,
}: SidebarSearchItemProps<TvShowWithMediaType>) => {
  return (
    <Link
      className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 hover:bg-muted"
      href={`/${language}/app/tv-shows/${item.id}`}
      key={item.id}
    >
      <span className="text-md truncate whitespace-nowrap">{item.name}</span>

      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {new Date(item.first_air_date).getFullYear()}
      </span>
    </Link>
  )
}

export const SidebarSearchPerson = ({
  item,
  language,
}: SidebarSearchItemProps<PersonWithMediaType>) => {
  return (
    <Link
      className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted"
      href={`/${language}/app/people/${item.id}`}
      key={item.id}
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
