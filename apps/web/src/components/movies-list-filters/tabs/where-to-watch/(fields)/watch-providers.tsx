'use client'

import { KeyboardEvent, useCallback, useMemo, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { Eye, X } from 'lucide-react'

import { useLanguage } from '@/context/language'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@plotwist/ui/components/ui/form'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from '@plotwist/ui/components/ui/command'
import { Badge } from '@plotwist/ui/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@plotwist/ui/components/ui/popover'
import { ScrollArea } from '@plotwist/ui/components/ui/scroll-area'
import { Button } from '@plotwist/ui/components/ui/button'

import { tmdbImage } from '@/utils/tmdb/image'
import { MoviesListFiltersFormValues } from '@/components/movies-list-filters'
import { tmdb } from '@plotwist/tmdb'

type Option = {
  value: number
  label: string
  logo: string
}

export const WatchProvidersField = () => {
  const { language, dictionary } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)

  const { control, setValue, watch } =
    useFormContext<MoviesListFiltersFormValues>()
  const watchRegion = watch('watch_region')

  const { data: watchProviders } = useQuery({
    queryKey: ['watch-providers', watchRegion],
    queryFn: async () =>
      await tmdb.watchProviders.list('movie', {
        language,
        watch_region: watchRegion,
      }),
  })

  const watchProvidersOptions: Option[] = useMemo(
    () =>
      watchProviders
        ? watchProviders.map((watchProvider) => ({
            label: watchProvider.provider_name,
            value: watchProvider.provider_id,
            logo: watchProvider.logo_path,
          }))
        : [],
    [watchProviders],
  )

  const handleUnselect = useCallback(
    (option: Option) => {
      const newSelectedWatchProviders = watch('with_watch_providers').filter(
        (genre) => genre !== option.value,
      )

      setValue('with_watch_providers', newSelectedWatchProviders)
    },
    [setValue, watch],
  )

  const handleSelect = useCallback(
    (option: Option) => {
      const prevSelectedWatchProviders = watch('with_watch_providers')

      const newSelectedWatchProviders = prevSelectedWatchProviders
        ? [...prevSelectedWatchProviders, option.value]
        : [option.value]

      setValue('with_watch_providers', newSelectedWatchProviders)
    },
    [setValue, watch],
  )

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
    [setValue, watch, inputRef],
  )

  const selectedWatchProviders = watchProvidersOptions.filter((genreOption) =>
    watch('with_watch_providers')?.includes(genreOption.value),
  )

  const selectableWatchProviders = watchProvidersOptions.filter(
    (option) =>
      !selectedWatchProviders
        .map((option) => option.value)
        .includes(option.value),
  )

  return (
    <FormField
      control={control}
      name="with_watch_providers"
      render={() => (
        <FormItem>
          <FormLabel>
            {dictionary.movies_list_filters.watch_providers_field.label}
          </FormLabel>

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
                      {selectedWatchProviders.map((selectedWatchProvider) => {
                        return (
                          <Badge
                            key={selectedWatchProvider.value}
                            variant="secondary"
                            className="gap-1"
                            onClick={(e) => e.preventDefault()}
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
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUnselect(selectedWatchProvider)
                                }
                              }}
                              onMouseDown={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              onClick={(e) => {
                                e.preventDefault()
                                handleUnselect(selectedWatchProvider)
                              }}
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
                      {
                        dictionary.movies_list_filters.watch_providers_field
                          .placeholder
                      }
                    </>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="max-h-none p-0" align="start">
                <Command onKeyDown={handleKeyDown}>
                  <CommandInput
                    placeholder={
                      dictionary.movies_list_filters.watch_providers_field
                        .placeholder
                    }
                    ref={inputRef}
                  />

                  <ScrollArea className="max-h-[300px] overflow-auto">
                    <CommandEmpty>
                      {
                        dictionary.movies_list_filters.watch_providers_field
                          .no_results
                      }
                    </CommandEmpty>

                    <CommandGroup>
                      {selectableWatchProviders.map(
                        (selectableWatchProvider) => {
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
                                  src={tmdbImage(selectableWatchProvider.logo)}
                                  alt={selectableWatchProvider.label}
                                  fill
                                  quality={25}
                                />
                              </div>

                              {selectableWatchProvider.label}
                            </CommandItem>
                          )
                        },
                      )}
                    </CommandGroup>
                  </ScrollArea>

                  {selectedWatchProviders.length > 0 && (
                    <>
                      <CommandSeparator />

                      <CommandGroup>
                        <CommandItem
                          onSelect={() => setValue('with_watch_providers', [])}
                          className="justify-center text-center"
                        >
                          {
                            dictionary.movies_list_filters.watch_providers_field
                              .clear_filters
                          }
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
