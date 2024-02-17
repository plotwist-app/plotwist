import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import ReactCountryFlag from 'react-country-flag'
import { useFormContext } from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useLanguage } from '@/context/language'
import { tmdb } from '@/services/tmdb'

type RegionOption = {
  label: string
  value: string
}

export const WatchRegion = () => {
  const { language } = useLanguage()
  const { control } = useFormContext()

  const { data: regions } = useQuery({
    queryKey: ['available-regions'],
    queryFn: async () =>
      await tmdb.watchProviders.availableRegions({
        language,
      }),
  })

  const regionsOptions: RegionOption[] = useMemo(
    () =>
      regions
        ? regions.map((region) => ({
            label: region.english_name,
            value: region.iso_3166_1,
          }))
        : [],
    [regions],
  )

  return (
    <FormField
      control={control}
      name="watch_region"
      render={({ field: { value } }) => (
        <FormItem>
          <FormLabel>Region</FormLabel>

          <FormControl>
            <Select disabled value={value}>
              <SelectTrigger className="">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>

              <SelectContent>
                {regionsOptions.map((regionOption) => (
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
