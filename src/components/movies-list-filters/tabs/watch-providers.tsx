'use client'

import { useLanguage } from '@/context/language'
import { tmdb } from '@/services/tmdb'
import { useQuery } from '@tanstack/react-query'
import { Command as CommandPrimitive } from 'cmdk'
import { FixedSizeList as List } from 'react-window'
import { useFormContext } from 'react-hook-form'

import {
  CSSProperties,
  KeyboardEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import { MoviesListFiltersFormValues } from '..'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Command, CommandGroup, CommandItem } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import Image from 'next/image'
import { tmdbImage } from '@/utils/tmdb/image'

type Option = {
  value: number
  label: string
  logo: string
}

type RowProps = { index: number; data: Option[]; style: CSSProperties }

export const WatchProviders = () => {
  const { language } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')
  const [open, setOpen] = useState(true)

  const { control, setValue, watch } =
    useFormContext<MoviesListFiltersFormValues>()

  const { data } = useQuery({
    queryKey: ['watch-providers'],
    queryFn: async () =>
      await tmdb.watchProviders.movieProviders({
        language,
      }),
  })

  const watchProvidersOptions: Option[] = useMemo(
    () =>
      data
        ? data.map((watchProvider) => ({
            label: watchProvider.provider_name,
            value: watchProvider.provider_id,
            logo: watchProvider.logo_path,
          }))
        : [],
    [data],
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
    [setValue, watch],
  )

  const selectedWatchProviders = watchProvidersOptions.filter(
    (genreOption) => watch('with_watch_providers')?.includes(genreOption.value),
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
          <FormLabel>Watch providers</FormLabel>

          <FormControl>
            <Command
              className="overflow-visible bg-transparent"
              onKeyDown={handleKeyDown}
            >
              <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <div className="flex flex-wrap gap-1">
                  {selectedWatchProviders.map((selectedWatchProvider) => (
                    <Badge
                      key={selectedWatchProvider.value}
                      variant="secondary"
                      className="gap-1"
                    >
                      <div className="relative h-5 w-5 overflow-hidden rounded-md">
                        <Image
                          src={tmdbImage(selectedWatchProvider.logo)}
                          alt={selectedWatchProvider.label}
                          fill
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
                        onClick={() => handleUnselect(selectedWatchProvider)}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <CommandPrimitive.Input
                  ref={inputRef}
                  value={inputValue}
                  onValueChange={setInputValue}
                  onBlur={() => setOpen(false)}
                  onFocus={() => setOpen(true)}
                  placeholder="watch provider"
                  className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </div>

              <div className="relative mt-2">
                {open && selectableWatchProviders.length > 0 ? (
                  <List
                    width="100%"
                    height={300}
                    itemSize={35}
                    itemCount={selectableWatchProviders.length}
                    itemData={selectableWatchProviders}
                    className="absolute top-0 z-10 w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in md:max-h-none"
                  >
                    {({ index, style, data }: RowProps) => {
                      return (
                        <div
                          className="flex cursor-pointer items-center gap-2 px-4"
                          onMouseDown={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                          }}
                          onClick={() => {
                            setInputValue('')
                            handleSelect(data[index])
                          }}
                          style={style}
                        >
                          <div className="relative h-5 w-5 overflow-hidden rounded-md">
                            <Image
                              src={tmdbImage(data[index].logo)}
                              alt={data[index].label}
                              fill
                            />
                          </div>

                          <div>{data[index].label}</div>
                        </div>
                      )
                    }}
                  </List>
                ) : null}
              </div>
            </Command>
          </FormControl>
        </FormItem>
      )}
    />
  )
}
