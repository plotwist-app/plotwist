import { useMemo, useState } from 'react'
import { useDebounce } from '@uidotdev/usehooks'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink, Plus, PlusCircle } from 'lucide-react'

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from '@/components/ui/command'
import { Separator } from '@/components/ui/separator'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

import { useLanguage } from '@/context/language'
import { tmdb } from '@/services/tmdb'
import { MovieWithMediaType, TvShowWithMediaType } from '@/services/tmdb/types'
import Link from 'next/link'
import { ListCommandItem } from './list-command-item'
import { ListCommandGroup } from './list-command-group'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import Image from 'next/image'
import { tmdbImage } from '@/utils/tmdb/image'
import { HoverCardPortal } from '@radix-ui/react-hover-card'
import { Badge } from '@/components/ui/badge'

type ListCommandVariant = 'poster' | 'button'
type ListCommandProps = { variant: ListCommandVariant }

export const ListCommand = ({ variant }: ListCommandProps) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const { language } = useLanguage()

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: async () => await tmdb.search.multi(debouncedSearch, language),
    staleTime: 1000,
  })

  const trigger: Record<ListCommandVariant, JSX.Element> = useMemo(
    () => ({
      button: (
        <div
          className="flex w-full cursor-pointer items-center justify-center rounded-md border border-dashed p-2"
          onClick={() => setOpen(true)}
        >
          <Plus size={16} />
        </div>
      ),
      poster: (
        <div
          className="flex aspect-[2/3] w-full cursor-pointer items-center justify-center rounded-md border border-dashed"
          onClick={() => setOpen(true)}
        >
          <Plus />
        </div>
      ),
    }),
    [],
  )

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
      ) as TvShowWithMediaType[],
    }
  }, [data])

  const hasMovies = useMemo(() => Boolean(movies.length), [movies])
  const hasTv = useMemo(() => Boolean(tv.length), [tv])

  return (
    <>
      {trigger[variant]}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput
            placeholder="Search for anything..."
            onValueChange={setSearch}
            value={search}
          />

          <CommandList>
            {isLoading && <p>loading...</p>}

            <div className="space-y-0">
              {hasMovies && (
                <ListCommandGroup.Root>
                  <ListCommandGroup.Label>Movies</ListCommandGroup.Label>

                  <ListCommandGroup.Items>
                    {movies.map((movie) => (
                      <HoverCard key={movie.id} openDelay={0} closeDelay={0}>
                        <ListCommandItem.Root>
                          <HoverCardTrigger>
                            <ListCommandItem.Label>
                              {movie.title}

                              {movie.release_date !== '' && (
                                <ListCommandItem.Year>
                                  • {new Date(movie.release_date).getFullYear()}
                                </ListCommandItem.Year>
                              )}
                            </ListCommandItem.Label>
                          </HoverCardTrigger>

                          <ListCommandItem.Dropdown>
                            <DropdownMenuItem>
                              <PlusCircle size={14} className="mr-1" />
                              Add to list
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                              <Link href="/movies">
                                <ExternalLink size={14} className="mr-1" />
                                View details
                              </Link>
                            </DropdownMenuItem>
                          </ListCommandItem.Dropdown>
                        </ListCommandItem.Root>

                        <HoverCardPortal>
                          <HoverCardContent
                            className="w-[320px] overflow-hidden rounded-lg p-0"
                            side="top"
                            align="start"
                          >
                            <ListCommandItem.Banner>
                              {movie.backdrop_path && (
                                <Image
                                  src={tmdbImage(movie.backdrop_path)}
                                  alt={movie.title}
                                  fill
                                />
                              )}
                            </ListCommandItem.Banner>

                            <ListCommandItem.Information>
                              <ListCommandItem.Poster>
                                {movie.poster_path && (
                                  <Image
                                    src={tmdbImage(movie.poster_path, 'w500')}
                                    alt={movie.title}
                                    fill
                                    objectFit="cover"
                                  />
                                )}
                              </ListCommandItem.Poster>

                              <ListCommandItem.Summary>
                                <ListCommandItem.Title>
                                  {movie.title}
                                </ListCommandItem.Title>

                                <ListCommandItem.Overview>
                                  {movie.overview}
                                </ListCommandItem.Overview>
                              </ListCommandItem.Summary>
                            </ListCommandItem.Information>
                          </HoverCardContent>
                        </HoverCardPortal>
                      </HoverCard>
                    ))}
                  </ListCommandGroup.Items>
                </ListCommandGroup.Root>
              )}

              {hasTv && hasMovies && <Separator />}

              {hasTv && (
                <ListCommandGroup.Root>
                  <ListCommandGroup.Label>TV Series</ListCommandGroup.Label>

                  <ListCommandGroup.Items>
                    {tv.map((movie) => (
                      <ListCommandItem.Root key={movie.id}>
                        <ListCommandItem.Label>
                          {movie.name}

                          <ListCommandItem.Year>
                            •{' '}
                            {movie.first_air_date !== '' &&
                              new Date(movie.first_air_date).getFullYear()}
                          </ListCommandItem.Year>
                        </ListCommandItem.Label>

                        <ListCommandItem.Dropdown>
                          <DropdownMenuItem>
                            <PlusCircle size={14} className="mr-1" />
                            Add to list
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link href="/movies">
                              <ExternalLink size={14} className="mr-1" />
                              View details
                            </Link>
                          </DropdownMenuItem>
                        </ListCommandItem.Dropdown>
                      </ListCommandItem.Root>
                    ))}
                  </ListCommandGroup.Items>
                </ListCommandGroup.Root>
              )}

              {(!hasMovies || !hasTv) && (
                <CommandEmpty>vazio carai</CommandEmpty>
              )}
            </div>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
