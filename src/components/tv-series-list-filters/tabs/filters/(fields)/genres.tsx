'use client'

import { useFormContext } from 'react-hook-form'
import { KeyboardEvent, useCallback, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Command as CommandPrimitive } from 'cmdk'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'

import { useLanguage } from '@/context/language'
import { tmdb } from '@/services/tmdb'

import { Command, CommandGroup, CommandItem } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { TvSeriesListFiltersFormValues } from '@/components/tv-series-list-filters'

type Option = {
  value: number
  label: string
}

export const GenresField = () => {
  const { language, dictionary } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')
  const [open, setOpen] = useState(false)

  const { control, setValue, watch } =
    useFormContext<TvSeriesListFiltersFormValues>()

  const { data } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => await tmdb.genres('tv', language),
  })

  const genresOptions: Option[] = useMemo(
    () =>
      data
        ? data.genres.map((genre) => ({
            label: genre.name,
            value: genre.id,
          }))
        : [],
    [data],
  )

  const handleUnselect = useCallback(
    (option: Option) => {
      const newSelectedGenres = watch('genres').filter(
        (genre) => genre !== option.value,
      )

      setValue('genres', newSelectedGenres)
    },
    [setValue, watch],
  )

  const handleSelect = useCallback(
    (option: Option) => {
      const prevSelectedGenres = watch('genres')

      const newSelectedGenres = prevSelectedGenres
        ? [...prevSelectedGenres, option.value]
        : [option.value]

      setValue('genres', newSelectedGenres)
    },
    [setValue, watch],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current

      if (input) {
        if (event.key === 'Delete' || event.key === 'Backspace') {
          if (input.value === '') {
            const newSelectedGenres = [...watch('genres')]
            newSelectedGenres.pop()

            setValue('genres', newSelectedGenres)
          }
        }

        if (event.key === 'Escape') {
          input.blur()
        }
      }
    },
    [setValue, watch],
  )

  const selectedGenres = genresOptions.filter(
    (genreOption) => watch('genres')?.includes(genreOption.value),
  )

  const selectableGenres = genresOptions.filter(
    (option) =>
      !selectedGenres.map((option) => option.value).includes(option.value),
  )

  return (
    <FormField
      control={control}
      name="genres"
      render={() => (
        <FormItem>
          <FormLabel>
            {dictionary.movies_list_filters.genres_field.label}
          </FormLabel>

          <FormControl>
            <Command
              onKeyDown={handleKeyDown}
              className="overflow-visible bg-transparent"
            >
              <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <div className="flex flex-wrap gap-1">
                  {selectedGenres.map((selectedGenre) => (
                    <Badge key={selectedGenre.value} variant="secondary">
                      {selectedGenre.label}

                      <button
                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUnselect(selectedGenre)
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onClick={() => handleUnselect(selectedGenre)}
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
                  placeholder={
                    dictionary.movies_list_filters.genres_field.placeholder
                  }
                  className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </div>

              <div className="relative mt-2">
                {open && selectableGenres.length > 0 ? (
                  <div className="absolute top-0 z-10 max-h-[200px] w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in md:max-h-none">
                    <CommandGroup className="h-full overflow-auto">
                      {selectableGenres.map((option) => {
                        return (
                          <CommandItem
                            key={option.value}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                            className={'cursor-pointer'}
                            onSelect={() => {
                              setInputValue('')
                              handleSelect(option)
                            }}
                          >
                            {option.label}
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </div>
                ) : null}
              </div>
            </Command>
          </FormControl>
        </FormItem>
      )}
    />
  )
}
