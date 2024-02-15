'use client'

import { FormProvider, useForm } from 'react-hook-form'
import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Filters, SortBy } from './tabs'
import { MoviesListFiltersFormValues } from './movies-list-filters-schema'
import { formatDateToURL } from '@/utils/date/format-date-to-url'
import { useLanguage } from '@/context/language'

const formatValueForQueryString = (
  key: string,
  value: Date | string,
): string => {
  if (value instanceof Date) {
    return `${encodeURIComponent(key)}=${encodeURIComponent(
      formatDateToURL(value),
    )}`
  }

  return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
}

const buildQueryStringFromValues = (
  values: MoviesListFiltersFormValues,
): string => {
  const parts: string[] = []

  Object.entries(values).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        if (value.length > 0) return parts.push(`${key}=${value.join(',')}`)
      }

      Object.entries(value).forEach(([subKey, subValue]) => {
        if (subValue) {
          parts.push(formatValueForQueryString(`${key}.${subKey}`, subValue))
        }
      })

      return
    }

    if (value) {
      parts.push(formatValueForQueryString(key, value))
    }
  })

  return parts.join('&')
}

export const MoviesListFilters = () => {
  const { replace } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { dictionary } = useLanguage()

  const getDefaultValues = () => {
    const startDate = searchParams.get('release_date.gte')
    const endDate = searchParams.get('release_date.lte')

    return {
      genres: searchParams.get('genres')?.split(',').map(Number),
      with_original_language:
        searchParams.get('with_original_language') ?? undefined,
      release_date: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      },
      sort_by: searchParams.get('sort_by') ?? undefined,
    }
  }

  const methods = useForm<MoviesListFiltersFormValues>({
    defaultValues: getDefaultValues(),
  })

  const [open, setOpen] = useState(false)

  const onSubmit = (values: MoviesListFiltersFormValues) => {
    const queryString = buildQueryStringFromValues(values)

    replace(`${pathname}?${queryString}`)
    setOpen(false)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal size={16} />
            </Button>
          </SheetTrigger>

          <SheetContent className="space-y-4">
            <SheetHeader>
              <SheetTitle>{dictionary.movies_list_filters.title}</SheetTitle>
            </SheetHeader>

            <div>
              <Tabs defaultValue="filters">
                <TabsList>
                  <TabsTrigger value="filters">
                    {dictionary.movies_list_filters.tabs.filters}
                  </TabsTrigger>

                  <TabsTrigger value="sort-by">
                    {dictionary.movies_list_filters.tabs.order}
                  </TabsTrigger>

                  <TabsTrigger value="watch-providers">
                    {dictionary.movies_list_filters.tabs.watch_providers}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="filters">
                  <Filters />
                </TabsContent>

                <TabsContent value="sort-by">
                  <SortBy />
                </TabsContent>

                <TabsContent value="watch-providers">
                  {dictionary.movies_list_filters.tabs.watch_providers}
                </TabsContent>
              </Tabs>
            </div>

            <SheetFooter>
              <SheetClose asChild>
                <Button type="submit" variant="outline">
                  {dictionary.movies_list_filters.actions.close}
                </Button>
              </SheetClose>

              <Button type="submit" onClick={methods.handleSubmit(onSubmit)}>
                {dictionary.movies_list_filters.actions.save_changes}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </form>
    </FormProvider>
  )
}
