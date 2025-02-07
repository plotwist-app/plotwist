import { useLanguage } from '@/context/language'
import { useMediaQuery } from '@plotwist/ui/hooks/use-media-query'
import { useState } from 'react'
import { Button } from '@plotwist/ui/components/ui/button'

import { FormProvider, useForm } from 'react-hook-form'
import type { CollectionFiltersFormValues } from './collection-filters-schema'
import type { UserItemStatus } from '@/types/user-item'
import { useLayoutContext } from '@/app/[lang]/[username]/_context'
import { TabsContent } from '@plotwist/ui/components/ui/tabs'
import { TabsList, TabsTrigger } from '@plotwist/ui/components/ui/tabs'
import { Tabs } from '@plotwist/ui/components/ui/tabs'
import {
  Sheet,
  SheetTitle,
  SheetHeader,
  SheetContent,
} from '@plotwist/ui/components/ui/sheet'
import { WatchRegion } from '../watch-region'
import { SortBy } from './tabs'
import { Filters } from './tabs/filters'
import { WatchProviders } from '../watch-providers'
import { DrawerFooter } from '@plotwist/ui/components/ui/drawer'
import { DrawerClose } from '@plotwist/ui/components/ui/drawer'
import { Drawer } from '@plotwist/ui/components/ui/drawer'
import { DrawerHeader, DrawerTrigger } from '@plotwist/ui/components/ui/drawer'
import { DrawerContent } from '@plotwist/ui/components/ui/drawer'
import { SlidersHorizontal } from 'lucide-react'

type CollectionFiltersProps = {
  status: UserItemStatus
}

export const CollectionFilters = ({ status }: CollectionFiltersProps) => {
  const { userId } = useLayoutContext()

  const [open, setOpen] = useState(false)

  const { dictionary, language } = useLanguage()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const defaultValues: CollectionFiltersFormValues = {
    status,
    userId,
    rating: [0, 5],
    mediaType: ['TV_SHOW', 'MOVIE'],
    orderBy: 'addedAt',
    orderDirection: 'asc',
  }

  const methods = useForm<CollectionFiltersFormValues>({
    defaultValues,
  })

  const onSubmit = (values: CollectionFiltersFormValues) => {
    console.log(values)
  }

  if (isDesktop) {
    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="space-y-4 overflow-y-auto">
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
                      <WatchProviders type="movie" />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
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
              <SheetTitle>{dictionary.collection_filters.title}</SheetTitle>
            </DrawerHeader>

            <div>
              <Tabs defaultValue="filters">
                <TabsList>
                  <TabsTrigger value="filters">
                    {dictionary.collection_filters.tabs.filters}
                  </TabsTrigger>

                  <TabsTrigger value="sort-by">
                    {dictionary.collection_filters.tabs.order}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="filters">
                  <Filters />
                </TabsContent>

                <TabsContent value="sort-by">
                  <SortBy />
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
