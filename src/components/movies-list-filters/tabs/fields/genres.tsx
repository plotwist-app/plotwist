'use client'

import { useFormContext } from 'react-hook-form'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'

import { MultiSelect, MultiSelectOption } from '@/components/multi-select'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { useLanguage } from '@/context/language'
import { tmdb } from '@/services/tmdb'
import { MoviesListFiltersFormValues } from '../../movies-list-filters-schema'

export const GenresField = () => {
  const { language } = useLanguage()
  const { control, setValue, watch } =
    useFormContext<MoviesListFiltersFormValues>()

  const { data } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => await tmdb.genres('movie', language),
  })

  const genresOptions = useMemo(
    () =>
      data
        ? data.genres.map((genre) => ({
            label: genre.name,
            value: genre.id,
          }))
        : [],
    [data],
  )

  const [selectedGenres, setSelectedGenres] = useState<MultiSelectOption[]>(
    genresOptions.filter((genre) => watch('genres').includes(genre.value)),
  )

  useEffect(() => {
    setValue(
      'genres',
      selectedGenres.map((genre) => Number(genre.value)),
    )
  }, [selectedGenres, setValue])

  return (
    <FormField
      control={control}
      name="genres"
      render={() => (
        <FormItem>
          <FormLabel>Gêneros</FormLabel>

          <FormControl>
            <MultiSelect
              placeholder="Selecione o gênero..."
              options={genresOptions}
              selectedOptions={selectedGenres}
              onSelectionChange={setSelectedGenres}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
