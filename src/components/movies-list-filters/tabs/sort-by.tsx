import { useFormContext } from 'react-hook-form'
import { ChevronDown, ChevronUp, MoveDown, MoveUp } from 'lucide-react'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MoviesListFiltersFormValues } from '..'

const options = [
  {
    label: 'Maior popularidade',
    value: 'popularity.desc',
  },
  {
    label: 'Menor popularidade',
    value: 'popularity.asc',
  },
  {
    label: 'Maior receita',
    value: 'revenue.desc',
  },
  {
    label: 'Menor receita',
    value: 'revenue.asc',
  },
  {
    label: 'Mais recente',
    value: 'primary_release_date.desc',
  },
  {
    label: 'Menos recente',
    value: 'primary_release_date.asc',
  },
  {
    label: 'Mais bem votado',
    value: 'vote_average.desc',
  },
  {
    label: 'Menos bem votado',
    value: 'vote_average.asc',
  },
  {
    label: 'Mais votado',
    value: 'vote_count.desc',
  },
  {
    label: 'Menos votado',
    value: 'vote_count.asc',
  },
] as const

export const SortBy = () => {
  const { control } = useFormContext<MoviesListFiltersFormValues>()

  return (
    <FormField
      control={control}
      name="sort_by"
      render={({ field: { value, onChange } }) => {
        return (
          <FormItem>
            <FormLabel>Sort by</FormLabel>

            <FormControl>
              <Select
                onValueChange={onChange}
                value={value}
                defaultValue={options[0].value}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>

                <SelectContent>
                  {options.map((option) => {
                    return (
                      <SelectItem value={option.value} key={option.value}>
                        {option.label}
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
