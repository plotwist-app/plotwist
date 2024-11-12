'use client'

import { PropsWithChildren, useMemo, useState } from 'react'
import { useDebounce } from '@uidotdev/usehooks'
import { useQuery } from '@tanstack/react-query'

import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
} from '@plotwist/ui/components/ui/command'
import { Separator } from '@plotwist/ui/components/ui/separator'

import { useLanguage } from '@/context/language'

import { tmdb, MovieWithMediaType, TvSerieWithMediaType } from '@/services/tmdb'

import {
  ListCommandMovies,
  ListCommandMoviesSkeleton,
} from './list-command-movies'
import { ListCommandTv, ListCommandTvSkeleton } from './list-command-tv'
import { MediaType } from '@/types/supabase/media-type'

export type ListCommandProps = {
  items: Array<{ tmdbId: number; id: string }>
  onAdd: (tmdbId: number, mediaType: MediaType, title: string) => void
  onRemove: (itemId: string) => void
} & PropsWithChildren

export const ListCommand = ({
  children,
  items,
  onAdd,
  onRemove,
}: ListCommandProps) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const { language, dictionary } = useLanguage()

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: async () => await tmdb.search.multi(debouncedSearch, language),
    staleTime: 1000,
  })

  const { movies, tv } = useMemo(() => {
    if (!data)
      return {
        movies: [],
        tv: [],
      }

    const { results } = data

    return {
      movies: results.filter(
        (result) => result.media_type === 'movie',
      ) as MovieWithMediaType[],

      tv: results.filter(
        (result) => result.media_type === 'tv',
      ) as TvSerieWithMediaType[],
    }
  }, [data])

  const hasMovies = useMemo(() => Boolean(movies.length), [movies])
  const hasTv = useMemo(() => Boolean(tv.length), [tv])

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput
            placeholder={dictionary.list_command.search_placeholder}
            onValueChange={setSearch}
            value={search}
          />

          <CommandList>
            <div className="space-y-0">
              {isLoading && (
                <>
                  <ListCommandMoviesSkeleton />
                  <ListCommandTvSkeleton />
                </>
              )}

              {hasMovies && (
                <ListCommandMovies
                  movies={movies}
                  items={items}
                  onAdd={onAdd}
                  onRemove={onRemove}
                />
              )}

              {hasTv && hasMovies && <Separator />}
              {hasTv && (
                <ListCommandTv
                  tv={tv}
                  items={items}
                  onAdd={onAdd}
                  onRemove={onRemove}
                />
              )}
            </div>

            {!hasMovies && !hasTv && (
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
