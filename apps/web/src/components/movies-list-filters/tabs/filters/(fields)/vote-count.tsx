import { MoviesListFiltersFormValues } from '@/components/movies-list-filters'
import { FormControl, FormItem, FormLabel } from '@/components/ui/form'
import { Slider } from '@/components/ui/slider'
import { useLanguage } from '@/context/language'
import { useFormContext } from 'react-hook-form'

export const VoteCountField = () => {
  const {
    dictionary: {
      movies_list_filters: {
        vote_count_field: { label },
      },
    },
  } = useLanguage()

  const { setValue, watch } = useFormContext<MoviesListFiltersFormValues>()

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>

      <FormControl>
        <div className="space-y-2">
          <Slider
            max={500}
            min={0}
            step={50}
            defaultValue={[0]}
            value={[watch('vote_count.gte')]}
            onValueChange={([start]) => {
              setValue('vote_count.gte', start)
            }}
          />

          <div className="flex w-full justify-between border-t">
            {Array.from({ length: 11 }).map((_, index) => (
              <div
                className="relative flex translate-x-[3px] flex-col items-center"
                key={index}
              >
                <div className="h-[4px] w-[1px] bg-muted" />
                <div className="text-xs">{index * 50}</div>
              </div>
            ))}
          </div>
        </div>
      </FormControl>
    </FormItem>
  )
}
