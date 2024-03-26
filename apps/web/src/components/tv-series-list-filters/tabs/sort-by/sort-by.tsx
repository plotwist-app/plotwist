import { useFormContext } from 'react-hook-form'
import { ChevronDown, ChevronUp } from 'lucide-react'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@plotwist/ui'

import { useLanguage } from '@/context/language'
import { TvSeriesListFiltersFormValues } from '../..'

const selectOptions = [
  'popularity.desc',
  'popularity.asc',
  'air_date.desc',
  'air_date.asc',
  'vote_average.desc',
  'vote_average.asc',
  'vote_count.desc',
  'vote_count.asc',
] as const

export const SortBy = () => {
  const { control } = useFormContext<TvSeriesListFiltersFormValues>()
  const { dictionary } = useLanguage()

  const { label, placeholder, options } =
    dictionary.tv_series_list_filters.sort_by

  return (
    <FormField
      control={control}
      name="sort_by"
      render={({ field: { value, onChange } }) => {
        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>

            <FormControl>
              <Select
                onValueChange={onChange}
                value={value}
                defaultValue={selectOptions[0]}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>

                <SelectContent>
                  {selectOptions.map((option) => {
                    return (
                      <SelectItem value={option} key={option}>
                        <div className="flex items-center gap-1">
                          {option.endsWith('asc') ? (
                            <ChevronDown width={16} height={16} />
                          ) : (
                            <ChevronUp width={16} height={16} />
                          )}

                          {options[option]}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </FormControl>

            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
