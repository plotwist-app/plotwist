'use client'

import { supabase } from '@/services/supabase'
import { List } from '@/types/supabase/lists'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import { ListItems } from './_components/list-items'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTableSkeleton } from './_components/data-table-skeleton'
import { useAuth } from '@/context/auth'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/language'
import { Banner } from '@/components/banner'
import { tmdbImage } from '@/utils/tmdb/image'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { ListForm } from '../_components/list-form'
import { listPageQueryKey } from '@/utils/list'

type ListPageProps = {
  params: { id: string }
}

const ListPage = ({ params: { id } }: ListPageProps) => {
  const { user } = useAuth()
  const { push } = useRouter()
  const { dictionary } = useLanguage()

  const { data: response, isLoading } = useQuery({
    queryKey: listPageQueryKey(id),
    queryFn: async () => {
      const response = await supabase
        .from('lists')
        .select('*, list_items(*, id)')
        .eq('id', id)
        .order('created_at', { referencedTable: 'list_items' })
        .single<List>()

      return response
    },
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <Skeleton className="h-full w-full" />
        </div>

        <div>
          <Skeleton className="mb-2 h-8 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
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
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {dictionary.list_page.list_not_found}
            </h1>

            <p className="text-muted-foreground">
              {dictionary.list_page.see_your_lists_or_create_new}{' '}
              <Link href="/app/lists" className="underline">
                {dictionary.list_page.here}
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  const list = response.data

  // TODO: REVER ISSO
  if (user?.id !== list.user_id) push('/app/lists')

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Banner url={tmdbImage(list.cover_path ?? '')} />

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{list.name}</h1>

            <ListForm
              trigger={
                <Button size="icon" variant="outline" className="h-6 w-6">
                  <Pencil className="h-3 w-3" />
                </Button>
              }
              list={list}
            />
          </div>

          <p className="text-muted-foreground">{list.description}</p>
        </div>
      </div>

      <ListItems listItems={list.list_items} />
    </div>
  )
}

export default ListPage
