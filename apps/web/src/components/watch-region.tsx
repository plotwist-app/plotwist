import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@plotwist/ui/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@plotwist/ui/components/ui/select'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import ReactCountryFlag from 'react-country-flag'
import { useFormContext } from 'react-hook-form'

import { useLanguage } from '@/context/language'
import { tmdb } from '@/services/tmdb'

type RegionOption = {
  label: string
  value: string
}

type WatchRegionFormValues = {
  watch_region: string
}

export const WatchRegion = () => {
  const { language, dictionary } = useLanguage()
  const { control } = useFormContext<WatchRegionFormValues>()

  const { data: regions } = useQuery({
    queryKey: ['available-regions'],
    queryFn: async () =>
      await tmdb.watchProviders.regions({
        language,
      }),
  })

  const regionsOptions: RegionOption[] = useMemo(
    () =>
      regions
        ? regions.map(region => ({
            label: region.english_name,
            value: region.iso_3166_1,
          }))
        : [],
    [regions]
  )

  return (
    <FormField
      control={control}
      name="watch_region"
      render={({ field: { value, onChange } }) => (
        <FormItem>
          <FormLabel>{dictionary.region}</FormLabel>

          <FormControl>
            <Select defaultValue={value} onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue placeholder={dictionary.select_the_region} />
              </SelectTrigger>

              <SelectContent>
                {regionsOptions.map(regionOption => (
                  <SelectItem
                    value={regionOption.value}
                    key={regionOption.value}
                  >
                    <ReactCountryFlag
                      countryCode={regionOption.value}
                      svg
                      className="mr-2"
                    />

                    {regionOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  )
}
