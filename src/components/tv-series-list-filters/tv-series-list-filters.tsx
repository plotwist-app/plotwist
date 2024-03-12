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

import { useLanguage } from '@/context/language'
import { useMediaQuery } from '@/hooks/use-media-query'

import { Filters, SortBy, WhereToWatch } from './tabs'
import {
  buildQueryStringFromValues,
  getDefaultValues,
} from './tv-series-list-filters.utils'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from '../ui/drawer'
import { TvSeriesListFiltersFormValues } from '.'

export const TvSeriesListFilters = () => {
  const [open, setOpen] = useState(false)

  const { replace } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { dictionary, language } = useLanguage()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const methods = useForm<TvSeriesListFiltersFormValues>({
    defaultValues: {
      ...getDefaultValues(searchParams),
      watch_region: language.split('-')[1],
    },
  })

  const onSubmit = (values: TvSeriesListFiltersFormValues) => {
    const queryString = buildQueryStringFromValues(values)

    replace(`${pathname}?${queryString}`)
    setOpen(false)
  }

  if (isDesktop) {
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
                <SheetTitle>
                  {dictionary.tv_shows_list_filters.title}
                </SheetTitle>
              </SheetHeader>

              <div>
                <Tabs defaultValue="filters">
                  <TabsList>
                    <TabsTrigger value="filters">
                      {dictionary.tv_shows_list_filters.tabs.filters}
                    </TabsTrigger>

                    <TabsTrigger value="sort-by">
                      {dictionary.tv_shows_list_filters.tabs.order}
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
                    <WhereToWatch />
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
                  <WhereToWatch />
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
