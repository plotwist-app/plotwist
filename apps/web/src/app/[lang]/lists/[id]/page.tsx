import { getListById } from '@/api/list'
import { verifySession } from '@/app/lib/dal'
import { ListModeContextProvider } from '@/context/list-mode'
import type { PageProps } from '@/types/languages'
import { Button } from '@plotwist/ui/components/ui/button'
import { Pencil } from 'lucide-react'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ListForm } from '../_components/list-form'
import { ListActions } from './_components/list-actions'
import { ListBanner } from './_components/list-banner'
import { ListItems } from './_components/list-items'
import { ListItemsSkeleton } from './_components/list-items/list-items-skeleton'
import { ListPrivate } from './_components/list-private'
import { UserResume } from './_components/user-resume'

type ListPageProps = PageProps<{ id: string }>

export async function generateMetadata(
  props: ListPageProps
): Promise<Metadata> {
  const params = await props.params
  const { list } = await getListById(params.id)

  const title = list.title
  const description = list.description || ''

  const images = list.bannerUrl ? [list.bannerUrl] : undefined

  return {
    title: `${title} • Plotwist`,
    description,
    openGraph: {
      title: `${title} • Plotwist`,
      description,
      siteName: 'Plotwist',
      images: images,
    },
    twitter: {
      title: `${title} • Plotwist`,
      description,
      images: images,
      card: 'summary_large_image',
    },
  }
}

export default async function ListPage({ params }: ListPageProps) {
  const { id } = await params

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

            <Suspense fallback={<ListItemsSkeleton />} key={id}>
              <ListItems listId={id} />
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
