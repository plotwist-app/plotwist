import type { CollectionFiltersFormValues } from '@/components/collection-filters/collection-filters-schema'
import { useLanguage } from '@/context/language'
import {
  FormControl,
  FormItem,
  FormLabel,
} from '@plotwist/ui/components/ui/form'
import { Slider } from '@plotwist/ui/components/ui/slider'
import { useFormContext } from 'react-hook-form'
import { v4 } from 'uuid'

export const RatingField = () => {
  const {
    dictionary: { collection_filters },
  } = useLanguage()
  const { setValue, watch } = useFormContext<CollectionFiltersFormValues>()

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
    </FormItem>
  )
}
