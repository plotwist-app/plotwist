'use client'

import { Badge } from '@plotwist/ui/components/ui/badge'
import { Button } from '@plotwist/ui/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@plotwist/ui/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@plotwist/ui/components/ui/popover'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@uidotdev/usehooks'
import { Loader2, Plus, Search, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import {
  type MovieWithMediaType,
  type TvSerieWithMediaType,
  tmdb,
} from '@/services/tmdb'
import { tmdbImage } from '@/utils/tmdb/image'

type TmdbItem = {
  id: number
  title: string
  posterPath: string | null
  year: string
  mediaType: 'movie' | 'tv'
}

type Props = {
  selectedIds: number[]
  mediaType: 'MOVIE' | 'TV_SHOW'
  onChange: (ids: number[]) => void
}

function toTmdbItem(
  result: MovieWithMediaType | TvSerieWithMediaType
): TmdbItem {
  if (result.media_type === 'movie') {
    return {
      id: result.id,
      title: result.title,
      posterPath: result.poster_path,
      year: result.release_date?.slice(0, 4) ?? '',
      mediaType: 'movie',
    }
  }
  return {
    id: result.id,
    title: result.name,
    posterPath: result.poster_path,
    year: result.first_air_date?.slice(0, 4) ?? '',
    mediaType: 'tv',
  }
}

async function fetchItemDetails(
  ids: number[],
  type: 'movie' | 'tv'
): Promise<TmdbItem[]> {
  const items: TmdbItem[] = []
  await Promise.allSettled(
    ids.map(async id => {
      if (type === 'movie') {
        const detail = await tmdb.movies.details(id, 'en-US')
        items.push({
          id: detail.id,
          title: detail.title,
          posterPath: detail.poster_path ?? null,
          year: detail.release_date?.slice(0, 4) ?? '',
          mediaType: 'movie',
        })
      } else {
        const detail = await tmdb.tv.details(id, 'en-US')
        items.push({
          id: detail.id,
          title: detail.name,
          posterPath: detail.poster_path ?? null,
          year: detail.first_air_date?.slice(0, 4) ?? '',
          mediaType: 'tv',
        })
      }
    })
  )
  return items
}

export function TmdbItemPicker({ selectedIds, mediaType, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const [manualItems, setManualItems] = useState<TmdbItem[]>([])

  const targetType = mediaType === 'MOVIE' ? 'movie' : 'tv'

  const { data: initialItems, isLoading: isLoadingInitial } = useQuery({
    queryKey: ['tmdb-initial-items', selectedIds.join(','), targetType],
    queryFn: () => fetchItemDetails(selectedIds, targetType as 'movie' | 'tv'),
    enabled: selectedIds.length > 0,
    staleTime: Number.POSITIVE_INFINITY,
  })

  const itemsMap = new Map<number, TmdbItem>()
  for (const item of initialItems ?? []) itemsMap.set(item.id, item)
  for (const item of manualItems) itemsMap.set(item.id, item)

  const { data, isLoading } = useQuery({
    queryKey: ['tmdb-search-admin', debouncedSearch],
    queryFn: () => tmdb.search.multi(debouncedSearch, 'en-US'),
    enabled: debouncedSearch.length >= 2,
    staleTime: 60_000,
  })

  const results =
    data?.results
      .filter(r => r.media_type === targetType)
      .map(r => toTmdbItem(r as MovieWithMediaType | TvSerieWithMediaType))
      .filter(r => !selectedIds.includes(r.id)) ?? []

  function handleSelect(item: TmdbItem) {
    const newIds = [...selectedIds, item.id]
    setManualItems(prev => [...prev, item])
    onChange(newIds)
  }

  function handleRemove(id: number) {
    onChange(selectedIds.filter(i => i !== id))
    setManualItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div className="space-y-3">
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {isLoadingInitial && manualItems.length === 0 ? (
            <div className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Loading items...
            </div>
          ) : (
            selectedIds.map(id => {
              const item = itemsMap.get(id)
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="gap-1.5 py-1 pl-1 pr-2"
                >
                  {item?.posterPath && (
                    <Image
                      src={tmdbImage(item.posterPath, 'w500')}
                      alt=""
                      width={20}
                      height={30}
                      className="rounded-sm"
                    />
                  )}
                  <span className="max-w-32 truncate">
                    {item?.title ?? `ID ${id}`}
                  </span>
                  {item?.year && (
                    <span className="text-muted-foreground">({item.year})</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(id)}
                    className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )
            })
          )}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-2">
            <Plus className="size-4" />
            Add {mediaType === 'MOVIE' ? 'movie' : 'TV show'}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-0"
          align="start"
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`Search ${mediaType === 'MOVIE' ? 'movies' : 'TV shows'}...`}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {debouncedSearch.length < 2 && (
                <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                  <Search className="size-5" />
                  <p className="text-sm">Type to search TMDB</p>
                </div>
              )}

              {debouncedSearch.length >= 2 && isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Searching...
                </div>
              )}

              {debouncedSearch.length >= 2 &&
                !isLoading &&
                results.length === 0 && (
                  <CommandEmpty>No results found.</CommandEmpty>
                )}

              {results.length > 0 && (
                <CommandGroup>
                  {results.slice(0, 10).map(item => (
                    <CommandItem
                      key={item.id}
                      value={String(item.id)}
                      onSelect={() => handleSelect(item)}
                      className="gap-3"
                    >
                      {item.posterPath ? (
                        <Image
                          src={tmdbImage(item.posterPath, 'w500')}
                          alt=""
                          width={28}
                          height={42}
                          className="rounded-sm shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-[42px] rounded-sm bg-muted shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {item.title}
                        </p>
                        {item.year && (
                          <p className="text-xs text-muted-foreground">
                            {item.year}
                          </p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
