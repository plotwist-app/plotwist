import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@plotwist/ui/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@plotwist/ui/components/ui/select'

import { useQuery } from '@tanstack/react-query'
import { useFormContext } from 'react-hook-form'

import type { TvSeriesListFiltersFormValues } from '@/components/tv-series-list-filters'
import { useLanguage } from '@/context/language'
import { tmdb } from '@/services/tmdb'

export const LanguageField = () => {
  const { dictionary } = useLanguage()

  const { data } = useQuery({
    queryKey: ['languages'],
    queryFn: () => tmdb.languages(),
  })

  const { control } = useFormContext<TvSeriesListFiltersFormValues>()

  const options = data?.map(language => ({
    value: language.iso_639_1,
    label: language.english_name,
  }))

  return (
    <FormField
      control={control}
      name="with_original_language"
      render={({ field: { onChange, value } }) => (
        <FormItem>
          <FormLabel>
            {dictionary.movies_list_filters.language_field.label}
          </FormLabel>

          <FormControl>
            <Select onValueChange={onChange} value={value}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    dictionary.movies_list_filters.language_field.placeholder
                  }
                />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectLabel>
                    {dictionary.movies_list_filters.language_field.label}
                  </SelectLabel>

                  {options?.map(option => (
                    <SelectItem value={option.value} key={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
