'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from '@uidotdev/usehooks'
import {
  type MovieWithMediaType,
  type TvSerieWithMediaType,
  tmdb,
} from '@plotwist/tmdb'
import { useQuery } from '@tanstack/react-query'

import { useLanguage } from '@/context/language'

import { Button } from '@plotwist/ui/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
} from '@plotwist/ui/components/ui/command'

import { CommandSearchSkeleton } from '@/components/command-search/command-search-items'
import { CommandSearchGroup } from '@/components/command-search/command-search-group'
import { PlusIcon } from 'lucide-react'
import {
  WatchListSearchMovie,
  WatchListSearchTvSerie,
} from './profile-watch-list-item'
import { useWatchList } from '@/hooks/use-watch-list'
import { toast } from 'sonner'

export const WatchListModalSearch = ({ userId }: { userId: string }) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const { language, dictionary } = useLanguage()

  const { handleAddToWatchList } = useWatchList({ userId })

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
        className="flex flex-row gap-2 w-full"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="size-4" />
        Add more movies or series
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
                      <WatchListSearchMovie
                        handleAddToWatchList={(tmdbId, type) =>
                          handleAddToWatchList.mutate(
                            {
                              tmdb_id: tmdbId,
                              type: type === 'MOVIE' ? 'MOVIE' : 'TV_SHOW',
                              user_id: userId,
                            },
                            {
                              onError: () => {
                                setOpen(false)

                                return toast.error(
                                  'There was a error trying to add this item to your Watchlist',
                                )
                              },
                              onSuccess: () =>
                                toast.success(
                                  'This item was added to your Watchlist',
                                ),
                            },
                          )
                        }
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
                      <WatchListSearchTvSerie
                        handleAddToWatchList={(tmdbId, type) =>
                          handleAddToWatchList.mutate(
                            {
                              tmdb_id: tmdbId,
                              type: type === 'MOVIE' ? 'MOVIE' : 'TV_SHOW',
                              user_id: userId,
                            },
                            {
                              onError: () => {
                                setOpen(false)

                                return toast.error(
                                  'There was a error trying to add this item to your Watchlist',
                                )
                              },
                              onSuccess: () => {
                                setOpen(false)

                                return toast.success(
                                  'This item was added to your Watchlist',
                                )
                              },
                            },
                          )
                        }
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
