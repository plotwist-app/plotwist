'use client'

import { Pencil } from 'lucide-react'

import { Button } from '@plotwist/ui/components/ui/button'
import { Banner } from '@/components/banner'

import { ListForm } from '../_components/list-form'
import { ListPageSkeleton } from './_components/list-page-skeleton'
import { ListPageEmptyResults } from './_components/list-page-results'
import { UserResume } from './_components/user-resume'
import { ListPrivate } from './_components/list-private'

import { tmdbImage } from '@/utils/tmdb/image'
import { useLanguage } from '@/context/language'
import { ListModeContextProvider } from '@/context/list-mode'
import { useSession } from '@/context/session'
import { useGetListById } from '@/api/list'
import { ListItems } from './_components/list-items'
import { Suspense } from 'react'

type ListPageProps = {
  params: { id: string }
}

const ListPage = ({ params: { id } }: ListPageProps) => {
  const { user } = useSession()
  const { dictionary } = useLanguage()
  const { data, isLoading } = useGetListById(id)

  if (!data || isLoading) return <ListPageSkeleton mode="SHOW" />
  const { list } = data

  const mode = user?.id === list.userId ? 'EDIT' : 'SHOW'
  if (isLoading) return <ListPageSkeleton mode={mode} />
  if (!list) return <ListPageEmptyResults dictionary={dictionary} />
  if (list.visibility === 'PRIVATE' && mode === 'SHOW') return <ListPrivate />

  return (
    <>
      <ListModeContextProvider mode={mode}>
        <div className="mx-auto max-w-6xl space-y-4 p-0 pb-4 lg:py-4 min-h-screen">
          <Banner
            url={list.coverPath ? tmdbImage(list.coverPath) : undefined}
          />

          <div className="grid grid-cols-1 gap-y-8 px-4 lg:grid-cols-3 lg:gap-x-16 lg:p-0">
            <div className="col-span-2 space-y-4">
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between">
                  <h1 className="text-xl font-bold">{list.title}</h1>

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

                    {/* {list.visibility === 'PUBLIC' && mode === 'SHOW' && (
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
                    )} */}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {list.description}
                </p>
              </div>

              <Suspense fallback={<p>loading...</p>}>
                <ListItems ownerId={list.userId} listId={list.id} />
              </Suspense>
            </div>

            <div className="col-span-1 space-y-4">
              <UserResume list={list} />
            </div>
          </div>
        </div>
      </ListModeContextProvider>
    </>
  )
}

export default ListPage
