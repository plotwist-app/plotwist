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

import { getUsersSearch } from '@/api/users'
import { Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { v4 } from 'uuid'
import {
  CommandSearchGroup,
  CommandSearchMovie,
  CommandSearchPerson,
  CommandSearchSkeleton,
  CommandSearchTvSerie,
  CommandSearchUser,
} from '../command-search'
import { CommandSearchIcon } from './command-search-icon'

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

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', debouncedSearch],
    queryFn: async () => await getUsers(debouncedSearch),
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

  const [hasMovies, hasTvSeries, hasPeople, hasUsers] = [
    Boolean(movies?.length),
    Boolean(tvSeries?.length),
    Boolean(people?.length),
    Boolean(users?.length),
  ]

  const hasResults = hasMovies || hasTvSeries || hasPeople || hasUsers

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
        <Command>
          <CommandInput
            placeholder={dictionary.sidebar_search.placeholder}
            onValueChange={setSearch}
            defaultValue={search}
          />

          <CommandList className="">
            {isLoading ||
              (isLoadingUsers && (
                <div className="space-y-8">
                  <CommandSearchGroup heading={dictionary.movies}>
                    {Array.from({ length: 5 }).map(_ => (
                      <CommandSearchSkeleton key={v4()} />
                    ))}
                  </CommandSearchGroup>

                  <CommandSearchGroup
                    heading={dictionary.sidebar_search.tv_series}
                  >
                    {Array.from({ length: 5 }).map(_ => (
                      <CommandSearchSkeleton key={v4()} />
                    ))}
                  </CommandSearchGroup>
                </div>
              ))}

            {hasResults ? (
              <div className="">
                {hasMovies && (
                  <CommandSearchGroup heading={dictionary.movies}>
                    {movies?.map(movie => (
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
                    {tvSeries?.map(tvSerie => (
                      <CommandSearchTvSerie
                        item={tvSerie}
                        language={language}
                        key={tvSerie.id}
                      />
                    ))}
                  </CommandSearchGroup>
                )}

                {hasPeople && (
                  <CommandSearchGroup heading={dictionary.people}>
                    {people?.map(person => (
                      <CommandSearchPerson
                        item={person}
                        language={language}
                        key={person.id}
                      />
                    ))}
                  </CommandSearchGroup>
                )}

                {hasUsers && (
                  <CommandSearchGroup heading={dictionary.users}>
                    {users?.map(user => (
                      <CommandSearchUser
                        item={user}
                        language={language}
                        key={user.id}
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

const getUsers = async (username: string) => {
  if (username.length >= 3) {
    const { users } = await getUsersSearch({ username: username })

    return users
  }

  return []
}
