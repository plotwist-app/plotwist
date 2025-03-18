import type { CollectionFiltersFormValues } from '@/components/collection-filters/collection-filters-schema'
import { useLanguage } from '@/context/language'
import { Checkbox } from '@plotwist/ui/components/ui/checkbox'
import {
  FormControl,
  FormItem,
  FormLabel,
} from '@plotwist/ui/components/ui/form'
import { useFormContext } from 'react-hook-form'

export const OnlyItemsWithoutReviewField = () => {
  const { setValue, watch } = useFormContext<CollectionFiltersFormValues>()
  const {
    dictionary: { collection_filters },
  } = useLanguage()

  return (
    <FormItem>
      <FormLabel>
        {collection_filters.only_items_without_review_field_label}
      </FormLabel>

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
