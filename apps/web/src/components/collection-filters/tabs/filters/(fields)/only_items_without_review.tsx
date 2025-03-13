import type { CollectionFiltersFormValues } from '@/components/collection-filters/collection-filters-schema'
import { useLanguage } from '@/context/language'
import { Checkbox } from '@plotwist/ui/components/ui/checkbox'
import {
  FormItem,
  FormLabel,
  FormControl,
} from '@plotwist/ui/components/ui/form'
import { useFormContext } from 'react-hook-form'

export const OnlyItemsWithoutReviewField = () => {
  const { setValue, watch } = useFormContext<CollectionFiltersFormValues>()
  const {
    dictionary: {
      collection_filters: {
        filters: { only_items_without_review_field },
      },
    },
  } = useLanguage()

  return (
    <FormItem>
      <FormLabel>{only_items_without_review_field.label}</FormLabel>

      <FormControl>
        <div className="flex flex-wrap gap-1">
          <Checkbox
            checked={watch('onlyItemsWithoutReview')}
            onCheckedChange={value =>
              setValue('onlyItemsWithoutReview', value as boolean)
            }
          />
        </div>
      </FormControl>
    </FormItem>
  )
}
