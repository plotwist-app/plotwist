import { getListById } from '@/api/list'
import { verifySession } from '@/app/lib/dal'
import { ListModeContextProvider } from '@/context/list-mode'
import { Button } from '@plotwist/ui/components/ui/button'
import { Pencil } from 'lucide-react'
import { Suspense } from 'react'
import { ListForm } from '../_components/list-form'
import { ListBanner } from './_components/list-banner'
import { ListItems } from './_components/list-items'
import { ListItemsSkeleton } from './_components/list-items/list-items-skeleton'
import { ListPrivate } from './_components/list-private'
import { UserResume } from './_components/user-resume'
import type { Metadata } from 'next'
import { tmdbImage } from '@/utils/tmdb/image'
import { ListActions } from './_components/list-actions'

type ListPageProps = {
  params: { id: string }
}

export async function generateMetadata({
  params,
}: ListPageProps): Promise<Metadata> {
  const { list } = await getListById(params.id)

  const title = list.title
  const description = list.description || ''

  const images = list.bannerPath ? [tmdbImage(list.bannerPath)] : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'Plotwist',
      images: images,
    },
    twitter: {
      title,
      description,
      images: images,
      card: 'summary_large_image',
    },
  }
}

export default async function ListPage({ params: { id } }: ListPageProps) {
  const session = await verifySession()
  const { list } = await getListById(id)

  const mode = session?.user.id === list.userId ? 'EDIT' : 'SHOW'
  if (list.visibility === 'PRIVATE' && mode === 'SHOW') return <ListPrivate />

  return (
    <ListModeContextProvider mode={mode}>
      <div className="mx-auto max-w-6xl space-y-4 pb-16  min-h-screen">
        <ListBanner list={list} />

        <div className="grid grid-cols-1 gap-y-8 px-4 lg:grid-cols-3 lg:gap-x-16 lg:p-0">
          <div className="col-span-2 space-y-4">
            <UserResume list={list} />

            <div className="flex justify-between">
              <div>
                <h1 className="text-xl font-bold">{list.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {list.description}
                </p>
              </div>

              <div className="flex gap-2">
                {mode === 'EDIT' && (
                  <ListForm
                    trigger={
                      <Button size="icon" variant="outline" className="h-8 w-8">
                        <Pencil className="h-3 w-3" />
                      </Button>
                    }
                    list={list}
                  />
                )}
              </div>
            </div>

            <Suspense fallback={<ListItemsSkeleton />} key={id}>
              <ListItems ownerId={list.userId} listId={id} />
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
