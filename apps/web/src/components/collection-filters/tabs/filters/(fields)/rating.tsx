import type { CollectionFiltersFormValues } from '@/components/collection-filters/collection-filters-schema'
import { useLanguage } from '@/context/language'
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@plotwist/ui/components/ui/form'
import { Slider } from '@plotwist/ui/components/ui/slider'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { v4 } from 'uuid'

export const RatingField = () => {
  const {
    dictionary: { collection_filters },
  } = useLanguage()
  const { setValue, watch } = useFormContext<CollectionFiltersFormValues>()

  const isDisabled = watch('onlyItemsWithoutReview') === true

  useEffect(() => {
    if (isDisabled) {
      setValue('rating', [0, 5])
    }
  }, [isDisabled, setValue])

  return (
    <FormItem>
      <FormLabel>{collection_filters.rating_field_label}</FormLabel>

      <FormControl>
        <div className="space-y-2">
          <Slider
            max={5}
            min={0}
            step={0.5}
            defaultValue={[0, 5]}
            value={watch('rating')}
            onValueChange={value => {
              setValue('rating', value)
            }}
            disabled={isDisabled}
          />

          <div className="flex w-full justify-between border-t">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                className="relative flex translate-x-[3px] flex-col items-center"
                key={v4()}
              >
                <div className="h-[4px] w-[1px] bg-muted" />
                <div className="text-xs">{index}</div>
              </div>
            ))}
          </div>
        </div>
      </FormControl>

      {isDisabled && (
        <FormMessage className="text-amber-500">
          {collection_filters.rating_disabled_message}
        </FormMessage>
      )}
    </FormItem>
  )
}
