import type { PageProps } from '@/types/languages'
import type { Metadata } from 'next'
import { getListById, getListBySlugAndUsername } from '@/api/list'
import { redirect } from 'next/navigation'
import { verifySession } from '@/app/lib/dal'
import { ListPrivate } from './_components/list-private'
import { ListModeContextProvider } from '@/context/list-mode'
import { ListBanner } from './_components/list-banner'
import { UserResume } from './_components/user-resume'
import { ListForm } from '@/app/[lang]/lists/_components/list-form'
import { Button } from '@plotwist/ui/components/ui/button'
import { Pencil } from 'lucide-react'
import { Suspense } from 'react'
import { ListItemsSkeleton } from './_components/list-items/list-items-skeleton'
import { ListItems } from './_components/list-items'
import { ListActions } from './_components/list-actions'

type ListPageProps = PageProps<{ slug: string; username: string }>

export async function generateMetadata(
  props: ListPageProps
): Promise<Metadata> {
  const { slug, username } = await props.params
  const { list } = await getListBySlugAndUsername({ slug, username })

  if (!list) {
    return {
      title: 'List not found',
      description: 'List not found',
    }
  }

  const title = list.title
  const description = list.description || ''

  const images = list.bannerUrl ? [list.bannerUrl] : undefined

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

export default async function Page(props: ListPageProps) {
  const { slug, username, lang } = await props.params
  const { list } = await getListBySlugAndUsername({ slug, username })

  if (!list) {
    redirect(`/${lang}/${username}/lists`)
  }

  const { list: listById } = await getListById(list.id)

  const session = await verifySession()
  const mode = session?.user.id === listById.userId ? 'EDIT' : 'SHOW'

  if (list.visibility === 'PRIVATE' && mode === 'SHOW') return <ListPrivate />

  return (
    <ListModeContextProvider mode={mode}>
      <div className="mx-auto max-w-6xl space-y-4 pb-16  min-h-screen">
        <ListBanner list={listById} />

        <div className="grid grid-cols-1 gap-y-8 px-4 lg:grid-cols-3 lg:gap-x-16 lg:p-0">
          <div className="col-span-2 space-y-4">
            <div className="flex justify-between">
              <UserResume list={listById} />
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
                    list={listById}
                  />
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {list.description}
              </p>
            </div>

            <Suspense fallback={<ListItemsSkeleton />} key={listById.id}>
              <ListItems listId={listById.id} />
            </Suspense>
          </div>

          <div className="col-span-1 space-y-4">
            <Suspense>
              <ListActions list={listById} />
            </Suspense>
          </div>
        </div>
      </div>
    </ListModeContextProvider>
  )
}
