'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from '@uidotdev/usehooks'
import { usePathname } from 'next/navigation'
import { MovieWithMediaType, TvSerieWithMediaType, tmdb } from '@plotwist/tmdb'
import { useQuery } from '@tanstack/react-query'

import { useLanguage } from '@/context/language'

import { Button } from '@/components/ui/button'
import { tmdbImage } from '@/utils/tmdb/image'
import { Command, CommandDialog, CommandInput } from '@/components/ui/command'

import { CommandSearchIcon } from './command-search-icon'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ScrollArea } from '../ui/scroll-area'
import { PosterCard } from '../poster-card'
import { Skeleton } from '../ui/skeleton'
import { CommandSearchMovies } from './command-search-movies'
import {
  CommandSearchHistory,
  handleAddHistory,
} from './command-search-history'

export const classnames = {
  scrollArea: 'h-[500px]',
  list: 'grid grid-cols-4 gap-x-2 gap-y-4 px-2 mb-4',
  counter:
    'ml-2 flex h-4 w-4 items-center justify-center rounded-sm bg-foreground text-[10px] font-bold text-background',
  counterSkeleton: 'ml-2 size-4 rounded-sm',
}

export const LOCAL_STORAGE_KEY = 'plotwist_command_search_history'

export const CommandSearch = () => {
  const { language, dictionary } = useLanguage()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const pathName = usePathname()

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: async () => {
      const response = await tmdb.search.multi(debouncedSearch, language)

      if (response.results.length > 0) {
        handleAddHistory(debouncedSearch.toLowerCase())
      }

      return response
    },
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

          <CommandSearchHistory search={debouncedSearch} />

          <Tabs defaultValue="movies" className="w-full">
            <TabsList className="m-2">
              <TabsTrigger value="movies">
                Filmes
                {isLoading ? (
                  <Skeleton className={classnames.counterSkeleton} />
                ) : (
                  <div className={classnames.counter}>
                    {movies?.length || 0}
                  </div>
                )}
              </TabsTrigger>

              <TabsTrigger value="tv-series">
                Séries
                {isLoading ? (
                  <Skeleton className={classnames.counterSkeleton} />
                ) : (
                  <div className={classnames.counter}>
                    {tvSeries?.length || 0}
                  </div>
                )}
              </TabsTrigger>

              <TabsTrigger value="people" disabled>
                Pessoas
              </TabsTrigger>

              <TabsTrigger value="members" disabled>
                Membros
              </TabsTrigger>
              <TabsTrigger value="lists" disabled>
                Listas
              </TabsTrigger>
              <TabsTrigger value="communities" disabled>
                Comunidades
              </TabsTrigger>
            </TabsList>

            <TabsContent value="movies" className="mt-0 h-[500px]">
              <CommandSearchMovies movies={movies} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="tv-series" className="mt-0">
              <ScrollArea className={classnames.scrollArea}>
                <div className={classnames.list}>
                  {tvSeries?.map((tv) => (
                    <Link href={`/${language}/tv-series/${tv.id}`} key={tv.id}>
                      <PosterCard.Root>
                        <PosterCard.Image
                          src={tmdbImage(tv.poster_path, 'w500')}
                          alt={tv.name}
                        />

                        <PosterCard.Details>
                          <PosterCard.Title>{tv.name}</PosterCard.Title>
                          <PosterCard.Year>
                            {tv.first_air_date.split('-')[0]}
                          </PosterCard.Year>
                        </PosterCard.Details>
                      </PosterCard.Root>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Command>
      </CommandDialog>
    </>
  )
}
