import { ChevronDown, ChevronUp } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@plotwist/ui/components/ui/form'

import { useLanguage } from '@/context/language'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@plotwist/ui/components/ui/select'

import type { CollectionFiltersFormValues } from '../../collection-filters-schema'

const options = [
  'addedAt.desc',
  'addedAt.asc',
  'updatedAt.desc',
  'updatedAt.asc',
  'rating.desc',
  'rating.asc',
] as const

export const SortBy = () => {
  const { control } = useFormContext<CollectionFiltersFormValues>()
  const { dictionary } = useLanguage()

  return (
    <FormField
      control={control}
      name="orderBy"
      render={({ field: { value, onChange } }) => {
        return (
          <FormItem>
            <FormLabel>{dictionary.collection_filters.sort_by.label}</FormLabel>

            <FormControl>
              <Select
                onValueChange={onChange}
                value={value}
                defaultValue={options[0]}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      dictionary.collection_filters.sort_by.placeholder
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {options.map(option => {
                    return (
                      <SelectItem value={option} key={option}>
                        <div className="flex items-center gap-1">
                          {option.endsWith('asc') ? (
                            <ChevronDown width={16} height={16} />
                          ) : (
                            <ChevronUp width={16} height={16} />
                          )}

                          {
                            dictionary.collection_filters.sort_by.options[
                              option
                            ]
                          }
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
