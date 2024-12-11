'use client'

import {
  type MovieWithMediaType,
  type PersonWithMediaType,
  type TvSerieWithMediaType,
  tmdb,
} from '@/services/tmdb'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@uidotdev/usehooks'
import { useEffect, useState } from 'react'

import { useLanguage } from '@/context/language'

import { Button } from '@plotwist/ui/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
} from '@plotwist/ui/components/ui/command'

import { Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import {
  CommandSearchMovie,
  CommandSearchPerson,
  CommandSearchTvSerie,
} from '../command-search'
import { CommandSearchIcon } from './command-search-icon'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@plotwist/ui/components/ui/tabs'

const ResultCount = ({ count }: { count: number }) => {
  return (
    <div className="tabular-nums ml-2 text-xs bg-foreground flex items-center justify-center size-4 rounded-md text-background">
      {count}
    </div>
  )
}

export const CommandSearch = () => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const { language, dictionary } = useLanguage()
  const pathname = usePathname()

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: async () => await tmdb.search.multi(debouncedSearch, language),
    staleTime: 1000,
  })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()

        setOpen(open => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (open) setOpen(false)
  }, [pathname])

  const [movies, tvSeries, people] = [
    data?.results.filter(
      result => result.media_type === 'movie'
    ) as MovieWithMediaType[],

    data?.results.filter(
      result => result.media_type === 'tv'
    ) as TvSerieWithMediaType[],

    data?.results.filter(
      result => result.media_type === 'person'
    ) as PersonWithMediaType[],
  ]

  const [hasMovies, hasTvSeries, hasPeople] = [
    Boolean(movies?.length),
    Boolean(tvSeries?.length),
    Boolean(people?.length),
  ]

  return (
    <>
      <Button
        variant="outline"
        className="flex lg:flex-1 justify-between gap-2 px-3 text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search size={16} />
        {dictionary.sidebar_search.search_everything}
        <CommandSearchIcon />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="max-w-xl">
          <CommandInput
            placeholder={dictionary.sidebar_search.search_everything}
            onValueChange={setSearch}
            defaultValue={search}
          />

          <CommandList />

          <Tabs defaultValue="movies">
            <TabsList className="mx-4 mt-4">
              <TabsTrigger value="movies" className="flex items-center">
                {dictionary.movies}
                {hasMovies && <ResultCount count={movies?.length} />}
              </TabsTrigger>

              <TabsTrigger value="tv_series">
                {dictionary.tv_series}
                {hasTvSeries && <ResultCount count={tvSeries?.length} />}
              </TabsTrigger>

              <TabsTrigger value="people">
                {dictionary.people}
                {hasPeople && <ResultCount count={people?.length} />}
              </TabsTrigger>

              <TabsTrigger value="lists" disabled>
                {dictionary.lists}
              </TabsTrigger>

              <TabsTrigger value="members" disabled>
                Membros
              </TabsTrigger>
            </TabsList>

            <CommandList className="px-4 pb-4">
              <TabsContent value="movies">
                {hasMovies ? (
                  movies.map(movie => (
                    <CommandSearchMovie
                      item={movie}
                      language={language}
                      key={movie.id}
                    />
                  ))
                ) : (
                  <p className="text-center p-8 text-muted-foreground">
                    {dictionary.list_command.no_results}
                  </p>
                )}
              </TabsContent>

              <TabsContent value="tv_series">
                {hasTvSeries ? (
                  tvSeries.map(tvSerie => (
                    <CommandSearchTvSerie
                      item={tvSerie}
                      language={language}
                      key={tvSerie.id}
                    />
                  ))
                ) : (
                  <p className="text-center p-8 text-muted-foreground">
                    {dictionary.list_command.no_results}
                  </p>
                )}
              </TabsContent>

              <TabsContent value="people">
                {hasPeople ? (
                  people.map(person => (
                    <CommandSearchPerson
                      item={person}
                      language={language}
                      key={person.id}
                    />
                  ))
                ) : (
                  <p className="text-center p-8 text-muted-foreground">
                    {dictionary.list_command.no_results}
                  </p>
                )}
              </TabsContent>
            </CommandList>
          </Tabs>
        </Command>
      </CommandDialog>
    </>
  )
}
