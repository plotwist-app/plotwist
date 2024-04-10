'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Banner } from '@/components/banner'

import { ListItems } from './_components/list-items'
import { DataTableSkeleton } from './_components/data-table'
import { ListForm } from '../_components/list-form'
import { ListRecommendations } from './_components/list-recommendations'
import { UserResume } from './_components/user-resume'

import { tmdbImage } from '@/utils/tmdb/image'
import { listPageQueryKey } from '@/utils/list'

import { useLanguage } from '@/context/language'
import { useAuth } from '@/context/auth'
import { ListModeContextProvider } from '@/context/list-mode'
import { fetchList } from '@/services/api/lists'
import { cn } from '@/lib/utils'

type ListPageProps = {
  params: { id: string }
}

const ListPage = ({ params: { id } }: ListPageProps) => {
  const { user } = useAuth()
  const { dictionary } = useLanguage()

  const { data: response, isLoading } = useQuery({
    queryKey: listPageQueryKey(id),
    queryFn: async () => await fetchList(id),
  })

  const mode = useMemo(() => {
    if (!user || !response?.data) return 'SHOW'

    const isOwner = user.id === response.data.user_id
    if (isOwner) return 'EDIT'

    return 'SHOW'
  }, [response, user])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-4 lg:px-0">
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <Skeleton className="h-full w-full" />
        </div>

        <div>
          <div className="flex items-start gap-2">
            <Skeleton className="mb-2 h-8 w-[20ch]" />

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              by
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-[2ex] w-[11ch]" />
            </div>
          </div>

          <Skeleton className="h-[1.5ex] w-[30ch]" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>

        <DataTableSkeleton />
      </div>
    )
  }

  if (!response?.data) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {dictionary.list_page.list_not_found}
            </h1>

            <p className="text-muted-foreground">
              {dictionary.list_page.see_your_lists_or_create_new}{' '}
              <Link href="/lists" className="underline">
                {dictionary.list_page.here}
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  const list = response.data

  return (
    <>
      <head>
        <title>{list.name}</title>
        <meta name="description" content={list.description} />
      </head>

      <ListModeContextProvider mode={mode}>
        <div className="mx-auto max-w-6xl space-y-4 p-0 lg:py-4">
          <Banner url={tmdbImage(list.cover_path ?? '')} />

          <div className="grid grid-cols-1 gap-y-8 p-4 lg:grid-cols-3 lg:gap-x-16 lg:p-0">
            <div
              className={cn(
                mode === 'EDIT'
                  ? 'col-span-2 space-y-4'
                  : 'col-span-3 space-y-4',
              )}
            >
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">{list.name}</h1>
                    <UserResume userId={list.user_id} />
                  </div>

                  {mode === 'EDIT' && (
                    <ListForm
                      trigger={
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      }
                      list={list}
                    />
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {list.description}
                </p>
              </div>

              <ListItems listItems={list.list_items} />
            </div>

            {mode === 'EDIT' && <ListRecommendations list={list} />}
          </div>
        </div>
      </ListModeContextProvider>
    </>
  )
}

export default ListPage
