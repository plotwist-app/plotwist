import type { CollectionFiltersFormValues } from '@/components/collection-filters/collection-filters-schema'
import { useLanguage } from '@/context/language'
import { Badge } from '@plotwist/ui/components/ui/badge'
import {
  FormControl,
  FormItem,
  FormLabel,
} from '@plotwist/ui/components/ui/form'
import { useFormContext } from 'react-hook-form'

export const MediaTypeField = () => {
  const {
    dictionary: {
      collection_filters: {
        filters: {
          media_type_field: { label, options },
        },
      },
    },
  } = useLanguage()
  const { setValue, watch } = useFormContext<CollectionFiltersFormValues>()

  const selectedMediaTypes = watch('mediaType') || []

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>

      <FormControl>
        <div className="flex flex-wrap gap-1">
          {Object.entries(options).map(([key, value]) => {
            const mediaType = key as 'TV_SHOW' | 'MOVIE'
            const isSelected = selectedMediaTypes.includes(mediaType)

            return (
              <Badge
                key={key}
                variant={isSelected ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  const newValue = isSelected
                    ? selectedMediaTypes.filter(type => type !== mediaType)
                    : [...selectedMediaTypes, mediaType]
                  setValue('mediaType', newValue)
                }}
              >
                {value}
              </Badge>
            )
          })}
        </div>
      </FormControl>
    </FormItem>
  )
}
