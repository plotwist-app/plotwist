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
  CommandSeparator,
} from '@plotwist/ui/components/ui/command'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@plotwist/ui/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@plotwist/ui/components/ui/popover'
import { ScrollArea } from '@plotwist/ui/components/ui/scroll-area'
import { useQuery } from '@tanstack/react-query'
import { Eye, X } from 'lucide-react'
import Image from 'next/image'
import { type KeyboardEvent, useCallback, useMemo, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { useLanguage } from '@/context/language'
import { tmdb } from '@/services/tmdb'
import { tmdbImage } from '@/utils/tmdb/image'

type Option = {
  value: number
  label: string
  logo: string
}

type WatchProvidersProps = {
  type?: 'movie' | 'tv'
}

type WatchProvidersFormValues = {
  with_watch_providers: number[]
  watch_region: string
}

export const WatchProviders = ({ type }: WatchProvidersProps) => {
  const { language, dictionary } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)

  const { control, setValue, watch } =
    useFormContext<WatchProvidersFormValues>()
  const watchRegion = watch('watch_region')

  const { data: watchProviders } = useQuery({
    queryKey: ['watch-providers', watchRegion],
    queryFn: async () => {
      if (type) {
        return await tmdb.watchProviders.list(type, {
          language,
          watch_region: watchRegion,
        })
      }

      const [movieProviders, tvProviders] = await Promise.all([
        tmdb.watchProviders.list('movie', {
          language,
          watch_region: watchRegion,
        }),
        tmdb.watchProviders.list('tv', {
          language,
          watch_region: watchRegion,
        }),
      ])

      const uniqueProvidersMap = new Map()

      for (const provider of movieProviders) {
        uniqueProvidersMap.set(provider.provider_id, provider)
      }

      for (const provider of tvProviders) {
        if (!uniqueProvidersMap.has(provider.provider_id)) {
          uniqueProvidersMap.set(provider.provider_id, provider)
        }
      }

      return Array.from(uniqueProvidersMap.values())
    },
  })

  const watchProvidersOptions: Option[] = useMemo(
    () =>
      watchProviders
        ? watchProviders.map(watchProvider => ({
            label: watchProvider.provider_name,
            value: watchProvider.provider_id,
            logo: watchProvider.logo_path,
          }))
        : [],
    [watchProviders]
  )

  const handleUnselect = useCallback(
    (option: Option) => {
      const newSelectedWatchProviders = watch('with_watch_providers').filter(
        genre => genre !== option.value
      )

      setValue('with_watch_providers', newSelectedWatchProviders)
    },
    [setValue, watch]
  )

  const handleSelect = useCallback(
    (option: Option) => {
      const prevSelectedWatchProviders = watch('with_watch_providers')

      const newSelectedWatchProviders = prevSelectedWatchProviders
        ? [...prevSelectedWatchProviders, option.value]
        : [option.value]

      setValue('with_watch_providers', newSelectedWatchProviders)
    },
    [setValue, watch]
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: setValue and watch from react-hook-form are stable, inputRef is a stable ref object
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current

      if (input) {
        if (event.key === 'Delete' || event.key === 'Backspace') {
          if (input.value === '') {
            const newSelectedWatchProviders = [...watch('with_watch_providers')]

            newSelectedWatchProviders.pop()

            setValue('with_watch_providers', newSelectedWatchProviders)
          }
        }

        if (event.key === 'Escape') {
          input.blur()
        }
      }
    },
    [setValue, watch, inputRef]
  )

  const selectedWatchProviders = watchProvidersOptions.filter(genreOption =>
    watch('with_watch_providers')?.includes(genreOption.value)
  )

  const selectableWatchProviders = watchProvidersOptions.filter(
    option =>
      !selectedWatchProviders.map(option => option.value).includes(option.value)
  )

  return (
    <FormField
      control={control}
      name="with_watch_providers"
      render={() => (
        <FormItem>
          <FormLabel>{dictionary.watch_providers_label}</FormLabel>

          <FormControl>
            <Popover modal>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-auto min-h-8 w-full justify-start border-dashed py-2 hover:bg-background"
                  size="sm"
                  disabled={!watch('watch_region')}
                >
                  {selectedWatchProviders.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedWatchProviders.map(selectedWatchProvider => {
                        return (
                          <Badge
                            key={selectedWatchProvider.value}
                            variant="secondary"
                            className="gap-1"
                            onClick={e => e.preventDefault()}
                          >
                            <div className="relative h-5 w-5 overflow-hidden rounded-md">
                              <Image
                                src={tmdbImage(selectedWatchProvider.logo)}
                                alt={selectedWatchProvider.label}
                                fill
                                quality={25}
                              />
                            </div>

                            {selectedWatchProvider.label}

                            <button
                              className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  handleUnselect(selectedWatchProvider)
                                }
                              }}
                              onMouseDown={e => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              onClick={e => {
                                e.preventDefault()
                                handleUnselect(selectedWatchProvider)
                              }}
                              type="button"
                            >
                              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      {dictionary.select_the_watch_providers}
                    </>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="max-h-none p-0" align="start">
                <Command onKeyDown={handleKeyDown}>
                  <CommandInput
                    placeholder={dictionary.select_the_watch_providers}
                    ref={inputRef}
                  />

                  <ScrollArea className="max-h-[300px] overflow-auto">
                    <CommandEmpty>
                      {
                        dictionary.movies_list_filters.watch_providers_field
                          .no_results
                      }
                    </CommandEmpty>

                    <CommandList>
                      <CommandGroup>
                        {selectableWatchProviders.map(
                          selectableWatchProvider => {
                            return (
                              <CommandItem
                                key={selectableWatchProvider.value}
                                className="flex cursor-pointer gap-2"
                                onSelect={() =>
                                  handleSelect(selectableWatchProvider)
                                }
                              >
                                <div className="relative h-5 w-5 overflow-hidden rounded-md">
                                  <Image
                                    src={tmdbImage(
                                      selectableWatchProvider.logo
                                    )}
                                    alt={selectableWatchProvider.label}
                                    fill
                                    quality={25}
                                  />
                                </div>

                                {selectableWatchProvider.label}
                              </CommandItem>
                            )
                          }
                        )}
                      </CommandGroup>
                    </CommandList>
                  </ScrollArea>

                  {selectedWatchProviders.length > 0 && (
                    <>
                      <CommandSeparator />

                      <CommandGroup>
                        <CommandItem
                          onSelect={() => setValue('with_watch_providers', [])}
                          className="justify-center text-center"
                        >
                          {dictionary.clear}
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
          </FormControl>
        </FormItem>
      )}
    />
  )
}
