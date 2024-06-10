'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from '@uidotdev/usehooks'
import { usePathname } from 'next/navigation'
import { MovieWithMediaType, TvSerieWithMediaType, tmdb } from '@plotwist/tmdb'
import { useQuery } from '@tanstack/react-query'

import { useLanguage } from '@/context/language'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
} from '@/components/ui/command'

import {
  CommandSearchMovie,
  CommandSearchGroup,
  CommandSearchSkeleton,
  CommandSearchTvSerie,
} from '../command-search'
import { CommandSearchIcon } from './command-search-icon'

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
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
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

  const [movies, tvSeries] = [
    data?.results.filter(
      (result) => result.media_type === 'movie',
    ) as MovieWithMediaType[],

    data?.results.filter(
      (result) => result.media_type === 'tv',
    ) as TvSerieWithMediaType[],
  ]

  const [hasMovies, hasTvSeries] = [
    Boolean(movies?.length),
    Boolean(tvSeries?.length),
  ]

  const hasResults = hasMovies || hasTvSeries

  return (
    <>
      <Button
        variant="outline"
        className="flex w-full flex-1 justify-between gap-2 pr-2 text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        {dictionary.sidebar_search.search_everything}

        <CommandSearchIcon />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput
            placeholder={dictionary.sidebar_search.placeholder}
            onValueChange={setSearch}
            value={search}
          />

          <CommandList className="">
            {isLoading && (
              <div className="space-y-8">
                <CommandSearchGroup heading={dictionary.sidebar_search.movies}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <CommandSearchSkeleton key={index} />
                  ))}
                </CommandSearchGroup>

                <CommandSearchGroup
                  heading={dictionary.sidebar_search.tv_series}
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <CommandSearchSkeleton key={index} />
                  ))}
                </CommandSearchGroup>
              </div>
            )}

            {hasResults ? (
              <div className="">
                {hasMovies && (
                  <CommandSearchGroup
                    heading={dictionary.sidebar_search.movies}
                  >
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
                    heading={dictionary.sidebar_search.tv_series}
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
              </div>
            ) : (
              <p className="p-8 text-center">
                {dictionary.list_command.no_results}
              </p>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
