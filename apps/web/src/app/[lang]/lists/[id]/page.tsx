'use client'

import { useMemo } from 'react'
import { Pencil } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Banner } from '@/components/banner'

import { ListItems } from './_components/list-items'
import { ListForm } from '../_components/list-form'
import { ListRecommendations } from './_components/list-recommendations'
import { UserResume } from './_components/user-resume'
import { ListPageSkeleton } from './_components/list-page-skeleton'
import { ListPageEmptyResults } from './_components/list-page-results'

import { tmdbImage } from '@/utils/tmdb/image'
import { listPageQueryKey } from '@/utils/list'

import { useLanguage } from '@/context/language'
import { useAuth } from '@/context/auth'
import { ListModeContextProvider } from '@/context/list-mode'
import { fetchList } from '@/services/api/lists'

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

  if (isLoading) return <ListPageSkeleton mode={mode} />
  if (!response?.data) return <ListPageEmptyResults dictionary={dictionary} />

  const list = response.data

  return (
    <>
      <head>
        <title>{list.name}</title>
        <meta name="description" content={list.description} />
      </head>

      <ListModeContextProvider mode={mode}>
        <div className="mx-auto max-w-6xl space-y-4 p-0 pb-4 lg:py-4">
          <Banner url={tmdbImage(list.cover_path ?? '')} />

          <div className="grid grid-cols-1 gap-y-8 px-4 lg:grid-cols-3 lg:gap-x-16 lg:p-0">
            <div className="col-span-2 space-y-4">
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

            <div className="col-span-1 space-y-4">
              {mode === 'EDIT' && <ListRecommendations list={list} />}
            </div>
          </div>
        </div>
      </ListModeContextProvider>
    </>
  )
}

export default ListPage
