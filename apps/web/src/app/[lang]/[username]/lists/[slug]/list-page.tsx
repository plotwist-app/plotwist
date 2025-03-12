'use client'

import { useGetListBySlugSuspense } from '@/api/list'
import { useLayoutContext } from '../../_context'
import { ListPrivate } from './_components/list-private'
import { ListModeContextProvider } from '@/context/list-mode'
import { useSession } from '@/context/session'
import { UserResume } from './_components/user-resume'
import { ListForm } from '@/app/[lang]/lists/_components/list-form'
import { Button } from '@plotwist/ui/components/ui/button'
import { Pencil } from 'lucide-react'
import { Suspense } from 'react'
import { ListItemsSkeleton } from './_components/list-items/list-items-skeleton'
import { ListItems } from './_components/list-items'
import { ListActions } from './_components/list-actions'
import { ListBanner } from './_components/list-banner'

type ListPageComponent = {
  slug: string
}

export function ListPageComponent({ slug }: ListPageComponent) {
  const { userId } = useLayoutContext()
  const { user } = useSession()

  const {
    data: { list },
  } = useGetListBySlugSuspense({ slug, userId })

  const mode = user?.id === list.userId ? 'EDIT' : 'SHOW'
  if (list.visibility === 'PRIVATE' && mode === 'SHOW') return <ListPrivate />

  return (
    <ListModeContextProvider mode={mode}>
      <div className="mx-auto max-w-6xl space-y-4 pb-16  min-h-screen">
        <ListBanner list={list} />

        <div className="grid grid-cols-1 gap-y-8 px-4 lg:grid-cols-3 lg:gap-x-16 lg:p-0">
          <div className="col-span-2 space-y-4">
            <div className="flex justify-between">
              <UserResume list={list} />
            </div>

            <div>
              <div className="flex gap-2 items-center">
                <h1 className="text-xl font-bold">{list.title}</h1>

                {mode === 'EDIT' && (
                  <ListForm
                    trigger={
                      <Button size="icon" variant="outline" className="h-6 w-6">
                        <Pencil className="h-2.5 w-2.5" />
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

            <Suspense fallback={<ListItemsSkeleton />} key={list.id}>
              <ListItems listId={list.id} />
            </Suspense>
          </div>

          <div className="col-span-1 space-y-4">
            <Suspense>
              <ListActions list={list} />
            </Suspense>
          </div>
        </div>
      </div>
    </ListModeContextProvider>
  )
}
