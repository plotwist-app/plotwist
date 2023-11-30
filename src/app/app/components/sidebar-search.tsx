'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from '@/components/ui/command'
import { TMDB } from '@/services/TMDB'
import { useDebounce } from '@uidotdev/usehooks'

import { Command as CommandIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { useQuery } from 'react-query'
import {
  MovieWithMediaType,
  PersonWithMediaType,
  TVWithMediaType,
} from 'tmdb-ts'

export const SidebarSearch = () => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const debouncedSearch = useDebounce(search, 500)

  const { data } = useQuery(
    ['search', debouncedSearch],
    async () =>
      await TMDB.search.multi({
        query: debouncedSearch,
      }),
    {
      keepPreviousData: true,
      staleTime: 1000,
    },
  )

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()

        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

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

  const hasResults =
    Boolean(movies?.length) ||
    Boolean(tvShows?.length) ||
    Boolean(people?.length)

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

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-muted-foreground">
                  Movies
                </h4>

                {movies?.map((movie) => (
                  <div
                    className="flex cursor-pointer items-center justify-between gap-4 rounded-sm px-2 py-1 hover:bg-muted"
                    key={movie.id}
                  >
                    <span className="truncate whitespace-nowrap text-sm">
                      {movie.title}
                    </span>

                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {movie.release_date}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-muted-foreground">
                  TV Shows
                </h4>

                {tvShows?.map((tvShow) => (
                  <div
                    className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 hover:bg-muted"
                    key={tvShow.id}
                  >
                    <span>{tvShow.name}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-muted-foreground">
                  People
                </h4>

                {people?.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted"
                  >
                    <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-muted-foreground">
                      {person.profile_path ? (
                        <Image
                          fill
                          className="object-cover"
                          src={`https://image.tmdb.org/t/p/original/${person.profile_path}`}
                          alt={person.name}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        person.name[0]
                      )}
                    </div>

                    <span>{person.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
