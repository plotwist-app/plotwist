'use client'

import { Command as CommandIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  MovieWithMediaType,
  PersonWithMediaType,
  TVWithMediaType,
} from 'tmdb-ts'
import { useDebounce } from '@uidotdev/usehooks'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from '@/components/ui/command'

import { SidebarSearchGroup } from './sidebar-search-group'
import { tmdb } from '@/services/tmdb2'
import { useLanguage } from '@/context/language'
import { tmdbImage } from '@/utils/tmdb/image'

export const SidebarSearch = () => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const pathName = usePathname()

  const { language } = useLanguage()

  const { data } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: async () => await tmdb.search.multi(debouncedSearch, language),
    staleTime: 1000,
  })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()

        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (open) setOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathName])

  const [movies, tvShows, people] = [
    data?.results.filter(
      (result) => result.media_type === 'movie',
    ) as MovieWithMediaType[],

    data?.results.filter(
      (result) => result.media_type === 'tv',
    ) as TVWithMediaType[],

    data?.results.filter(
      (result) => result.media_type === 'person',
    ) as PersonWithMediaType[],
  ]

  const [hasMovies, hasTVShows, hasPeople] = [
    Boolean(movies?.length),
    Boolean(tvShows?.length),
    Boolean(people?.length),
  ]
  const hasResults = hasMovies || hasTVShows || hasPeople

  return (
    <>
      <Button
        variant="outline"
        className="flex w-full justify-between pr-2 text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        Search everything
        <div className="flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          <CommandIcon size={12} />K
        </div>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput
            placeholder="Type a command or search..."
            onValueChange={setSearch}
            value={search}
          />

          <CommandList className=" p-4">
            {!hasResults && <CommandEmpty>No results found.</CommandEmpty>}

            <div className="space-y-8">
              {hasMovies && (
                <SidebarSearchGroup heading="Movies">
                  {movies?.map((movie) => (
                    <Link
                      href={`/${language}/app/movies/${movie.id}`}
                      className="flex cursor-pointer items-center justify-between gap-4 rounded-sm px-2 py-1 hover:bg-muted"
                      key={movie.id}
                    >
                      <span className="text-md truncate whitespace-nowrap">
                        {movie.title}
                      </span>

                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(movie.release_date).getFullYear()}
                      </span>
                    </Link>
                  ))}
                </SidebarSearchGroup>
              )}

              {hasTVShows && (
                <SidebarSearchGroup heading="TV Shows">
                  {tvShows?.map((tvShow) => (
                    <Link
                      className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 hover:bg-muted"
                      href={`/${language}/app/tv-shows/${tvShow.id}`}
                      key={tvShow.id}
                    >
                      <span className="text-md truncate whitespace-nowrap">
                        {tvShow.name}
                      </span>

                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(tvShow.first_air_date).getFullYear()}
                      </span>
                    </Link>
                  ))}
                </SidebarSearchGroup>
              )}

              {hasPeople && (
                <SidebarSearchGroup heading="People">
                  {people?.map((person) => (
                    <Link
                      className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted"
                      href={`/${language}/app/people/${person.id}`}
                      key={person.id}
                    >
                      <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-muted-foreground">
                        {person.profile_path ? (
                          <Image
                            fill
                            className="object-cover"
                            src={tmdbImage(person.profile_path)}
                            alt={person.name}
                            loading="lazy"
                            sizes="100%"
                          />
                        ) : (
                          person.name[0]
                        )}
                      </div>

                      <span className="text-sm">{person.name}</span>
                    </Link>
                  ))}
                </SidebarSearchGroup>
              )}
            </div>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
