'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from '@uidotdev/usehooks'
import { usePathname } from 'next/navigation'

import { useQuery } from '@tanstack/react-query'
import { tmdb } from '@/services/tmdb'

import { useLanguage } from '@/context/language'

import { Command as CommandIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from '@/components/ui/command'
import {
  CommandSearchMovie,
  CommandSearchPerson,
  CommandSearchGroup,
  CommandSearchSkeleton,
  CommandSearchTvSerie,
} from '../command-search'

import {
  MovieWithMediaType,
  PersonWithMediaType,
  TvSerieWithMediaType,
} from '@/services/tmdb/types'

export const CommandSearch = () => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const pathName = usePathname()
  const { language, dictionary } = useLanguage()

  const { data, isLoading } = useQuery({
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

  const [movies, tvSeries, people] = [
    data?.results.filter(
      (result) => result.media_type === 'movie',
    ) as MovieWithMediaType[],

    data?.results.filter(
      (result) => result.media_type === 'tv',
    ) as TvSerieWithMediaType[],

    data?.results.filter(
      (result) => result.media_type === 'person',
    ) as PersonWithMediaType[],
  ]

  const [hasMovies, hasTvSeries, hasPeople] = [
    Boolean(movies?.length),
    Boolean(tvSeries?.length),
    Boolean(people?.length),
  ]

  const hasResults = hasMovies || hasTvSeries || hasPeople

  return (
    <>
      <Button
        variant="outline"
        className="flex w-full flex-1 justify-between gap-2 pr-2 text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        {dictionary.sidebar_search.search_everything}

        <div className="flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          <CommandIcon size={12} />K
        </div>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput
            placeholder={dictionary.sidebar_search.placeholder}
            onValueChange={setSearch}
            value={search}
          />

          <CommandList className="p-4">
            {isLoading && (
              <div className="space-y-8">
                <CommandSearchGroup heading={dictionary.sidebar_search.movies}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <CommandSearchSkeleton key={index} />
                  ))}
                </CommandSearchGroup>

                <CommandSearchGroup
                  heading={dictionary.sidebar_search.tv_shows}
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <CommandSearchSkeleton key={index} />
                  ))}
                </CommandSearchGroup>
              </div>
            )}

            {!hasResults && (
              <CommandEmpty>
                {dictionary.sidebar_search.no_results}
              </CommandEmpty>
            )}

            <div className="space-y-8">
              {hasMovies && (
                <CommandSearchGroup heading={dictionary.sidebar_search.movies}>
                  {movies?.map((movie) => (
                    <CommandSearchMovie
                      item={movie}
                      language={language}
                      key={movie.id}
                    />
                  ))}
                </CommandSearchGroup>
              )}

              {hasTvSeries && (
                <CommandSearchGroup
                  heading={dictionary.sidebar_search.tv_shows}
                >
                  {tvSeries?.map((tvSerie) => (
                    <CommandSearchTvSerie
                      item={tvSerie}
                      language={language}
                      key={tvSerie.id}
                    />
                  ))}
                </CommandSearchGroup>
              )}

              {hasPeople && (
                <CommandSearchGroup heading={dictionary.sidebar_search.people}>
                  {people?.map((person) => (
                    <CommandSearchPerson
                      item={person}
                      language={language}
                      key={person.id}
                    />
                  ))}
                </CommandSearchGroup>
              )}
            </div>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
