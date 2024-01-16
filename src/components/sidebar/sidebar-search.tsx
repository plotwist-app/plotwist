'use client'

import { Command as CommandIcon } from 'lucide-react'
import React, { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  MovieWithMediaType,
  PersonWithMediaType,
  TVWithMediaType,
} from 'tmdb-ts'
import { useDebounce } from '@uidotdev/usehooks'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from '@/components/ui/command'
import { TMDB } from '@/services/TMDB'

import { SidebarSearchMovie } from './sidebar-search-movie'
import { SidebarSearchTvShow } from './sidebar-search-tv-show'
import { SidebarSearchPerson } from './sidebar-search-person'
import { SidebarSearchGroup } from './sidebar-search-group'

export const SidebarSearch = () => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const debouncedSearch = useDebounce(search, 500)
  const pathName = usePathname()

  const { data } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: async () =>
      await TMDB.search.multi({
        query: debouncedSearch,
      }),
    staleTime: 1000,
  })

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
                    <SidebarSearchMovie movie={movie} key={movie.id} />
                  ))}
                </SidebarSearchGroup>
              )}

              {hasTVShows && (
                <SidebarSearchGroup heading="TV Shows">
                  {tvShows?.map((tvShow) => (
                    <SidebarSearchTvShow tvShow={tvShow} key={tvShow.id} />
                  ))}
                </SidebarSearchGroup>
              )}

              {hasPeople && (
                <SidebarSearchGroup heading="People">
                  {people?.map((person) => (
                    <SidebarSearchPerson person={person} key={person.id} />
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
