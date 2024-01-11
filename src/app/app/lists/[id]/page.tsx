'use client'

import { supabase } from '@/services/supabase'
import { List } from '@/types/supabase/lists'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import { ListItems } from './components/list-items'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTableSkeleton } from './components/data-table-skeleton'
import { useAuth } from '@/context/auth'
import { useRouter } from 'next/navigation'

const ListPage = ({ params }: { params: { id: string } }) => {
  const { user } = useAuth()
  const { push } = useRouter()

  const { data: response, isLoading } = useQuery({
    queryKey: [Number(params.id)],
    queryFn: async () => {
      const response = await supabase
        .from('lists')
        .select('*, list_items(*, id)')
        .eq('id', params.id)
        .order('id', { referencedTable: 'list_items' })
        .single<List>()

      return response
    },
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
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
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">List not found.</h1>

            <p className="text-muted-foreground">
              See your lists or create new clicking{' '}
              <Link href="/app/lists" className="underline">
                here
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  const list = response.data

  // TODO: REVER ISSO
  if (user.id !== list.user_id) push('/app/lists')

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{list.name}</h1>
          <p className="text-muted-foreground">{list.description}</p>
        </div>
      </div>

      <ListItems listItems={list.list_items} />
    </div>
  )
}

export default ListPage
