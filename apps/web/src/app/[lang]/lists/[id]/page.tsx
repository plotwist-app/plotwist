'use client'

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
import { fetchList } from '@/services/api/lists/fetch-list'
import { ListPrivate } from './_components/list-private'
import { useList } from '@/hooks/use-list'
import { getOldestItem } from '@/utils/array/get-oldest-item'

type ListPageProps = {
  params: { id: string }
}

const ListPage = ({ params: { id } }: ListPageProps) => {
  const { user } = useAuth()
  const { dictionary } = useLanguage()
  const { handleLike, handleRemoveLike } = useList()

  const { data: list, isLoading } = useQuery({
    queryKey: listPageQueryKey(id),
    queryFn: async () => await fetchList(id),
  })

  const mode = user?.id === list?.user_id ? 'EDIT' : 'SHOW'
  const userLike = list?.list_likes.find((like) => like.user_id === user?.id)

  if (isLoading) return <ListPageSkeleton mode={mode} />
  if (!list) return <ListPageEmptyResults dictionary={dictionary} />
  if (list.visibility === 'PRIVATE' && mode === 'SHOW') return <ListPrivate />

  const backdropUrl = getOldestItem(list?.list_items) || ''

  return (
    <>
      <head>
        <title>{list.name}</title>
        <meta name="description" content={list.description} />
      </head>

      <ListModeContextProvider mode={mode}>
        <div className="mx-auto max-w-6xl space-y-4 p-0 pb-4 lg:py-4">
          <Banner url={tmdbImage(list.cover_path ?? backdropUrl)} />

          <div className="grid grid-cols-1 gap-y-8 px-4 lg:grid-cols-3 lg:gap-x-16 lg:p-0">
            <div className="col-span-2 space-y-4">
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between">
                  <h1 className="text-xl font-bold">{list.name}</h1>

                  <div className="flex gap-2">
                    {mode === 'EDIT' && (
                      <ListForm
                        trigger={
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        }
                        list={list}
                      />
                    )}

                    {list.visibility === 'PUBLIC' && mode === 'SHOW' && (
                      <Button
                        size="sm"
                        variant={userLike ? 'default' : 'outline'}
                        onClick={() => {
                          if (userLike) {
                            return handleRemoveLike.mutate(userLike.id)
                          }

                          if (user) {
                            handleLike.mutate({
                              listId: list.id,
                              userId: user.id,
                            })
                          }
                        }}
                        disabled={!user}
                        loading={
                          handleLike.isPending || handleRemoveLike.isPending
                        }
                      >
                        ❤<span className="ml-1">{list.list_likes.length}</span>
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {list.description}
                </p>
              </div>

              <ListItems listItems={list.list_items} />
            </div>

            <div className="col-span-1 space-y-4">
              <UserResume userId={list.user_id} />

              {mode === 'EDIT' && <ListRecommendations list={list} />}
            </div>
          </div>
        </div>
      </ListModeContextProvider>
    </>
  )
}

export default ListPage
