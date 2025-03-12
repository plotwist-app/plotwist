'use client'

import { SlidersHorizontal } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { Button } from '@plotwist/ui/components/ui/button'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@plotwist/ui/components/ui/sheet'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@plotwist/ui/components/ui/tabs'

import { useLanguage } from '@/context/language'
import { useMediaQuery } from '@/hooks/use-media-query'

import { Filters, SortBy } from './tabs'
import {
  buildQueryStringFromValues,
  getDefaultValues,
} from './tv-series-list-filters.utils'

import { useUserPreferences } from '@/context/user-preferences'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from '@plotwist/ui/components/ui/drawer'
import type { TvSeriesListFiltersFormValues } from '.'
import { WatchProviders } from '../watch-providers'
import { WatchRegion } from '../watch-region'

export const TvSeriesListFilters = () => {
  const [open, setOpen] = useState(false)

  const { replace } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { dictionary, language } = useLanguage()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { userPreferences } = useUserPreferences()

  const defaultValues = {
    ...getDefaultValues(searchParams, userPreferences),
    watch_region: userPreferences?.watchRegion
      ? userPreferences.watchRegion
      : language.split('-')[1],
  }

  const methods = useForm<TvSeriesListFiltersFormValues>({
    defaultValues,
  })

  const onSubmit = (values: TvSeriesListFiltersFormValues) => {
    const queryString = buildQueryStringFromValues(values)

    replace(`${pathname}?${queryString}`)
    setOpen(false)
  }

  const hasFilters = Object.keys(defaultValues).some(key =>
    searchParams.get(key)
  )

  if (isDesktop) {
    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant={hasFilters ? 'default' : 'outline'} size="icon">
                <SlidersHorizontal size={16} />
              </Button>
            </SheetTrigger>

            <SheetContent className="space-y-4 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>
                  {dictionary.tv_series_list_filters.title}
                </SheetTitle>
              </SheetHeader>

              <div>
                <Tabs defaultValue="filters">
                  <TabsList>
                    <TabsTrigger value="filters">
                      {dictionary.tv_series_list_filters.tabs.filters}
                    </TabsTrigger>

                    <TabsTrigger value="sort-by">
                      {dictionary.tv_series_list_filters.tabs.order}
                    </TabsTrigger>

                    <TabsTrigger value="where-to-watch">
                      {dictionary.movies_list_filters.tabs.watch_providers}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="filters">
                    <Filters />
                  </TabsContent>

                  <TabsContent value="sort-by">
                    <SortBy />
                  </TabsContent>

                  <TabsContent value="where-to-watch">
                    <div className="space-y-4">
                      <WatchRegion />
                      <WatchProviders type="tv" />
                    </div>
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

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal size={16} />
            </Button>
          </DrawerTrigger>

          <DrawerContent className="space-y-2 px-4">
            <DrawerHeader>
              <SheetTitle>{dictionary.movies_list_filters.title}</SheetTitle>
            </DrawerHeader>

            <div>
              <Tabs defaultValue="filters">
                <TabsList>
                  <TabsTrigger value="filters">
                    {dictionary.movies_list_filters.tabs.filters}
                  </TabsTrigger>

                  <TabsTrigger value="sort-by">
                    {dictionary.movies_list_filters.tabs.order}
                  </TabsTrigger>

                  <TabsTrigger value="where-to-watch">
                    {dictionary.movies_list_filters.tabs.watch_providers}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="filters">
                  <Filters />
                </TabsContent>

                <TabsContent value="sort-by">
                  <SortBy />
                </TabsContent>

                <TabsContent value="where-to-watch">
                  <div className="space-y-4">
                    <WatchRegion />
                    <WatchProviders type="tv" />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DrawerFooter className="flex-row justify-end px-0">
              <DrawerClose asChild>
                <Button type="submit" variant="outline">
                  {dictionary.movies_list_filters.actions.close}
                </Button>
              </DrawerClose>

              <Button type="submit" onClick={methods.handleSubmit(onSubmit)}>
                {dictionary.movies_list_filters.actions.save_changes}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </form>
    </FormProvider>
  )
}
