'use client'

import { FormProvider, useForm } from 'react-hook-form'
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

import { Filters } from './tabs'
import { MoviesListFiltersFormValues } from './movies-list-filters-schema'
import { formatDateToURL } from '@/utils/date/format-date-to-url'
import { useState } from 'react'

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

  const methods = useForm<MoviesListFiltersFormValues>({
    defaultValues: {
      genres: searchParams.get('genres')?.split(',').map(Number),
    },
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
              <SheetTitle>Discover movies</SheetTitle>
            </SheetHeader>

            <div>
              <Tabs defaultValue="filters">
                <TabsList>
                  <TabsTrigger value="filters">Filtros</TabsTrigger>
                  <TabsTrigger value="order">Ordenar</TabsTrigger>
                  <TabsTrigger value="watch-providers">
                    Onde assistir
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="filters">
                  <Filters />
                </TabsContent>

                <TabsContent value="order">Ordenar</TabsContent>
                <TabsContent value="watch-providers">Onde assistir</TabsContent>
              </Tabs>
            </div>

            <SheetFooter>
              <SheetClose asChild>
                <Button type="submit" variant="outline">
                  Close
                </Button>
              </SheetClose>

              <Button type="submit" onClick={methods.handleSubmit(onSubmit)}>
                Save changes
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </form>
    </FormProvider>
  )
}
