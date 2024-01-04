'use client'

import { supabase } from '@/services/supabase'
import { List } from '@/types/lists'
import Link from 'next/link'

import { useQuery } from '@tanstack/react-query'
import { ListItems } from './components/list-items'

const ListPage = ({ params }: { params: { id: string } }) => {
  const { data } = useQuery({
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

  if (!data?.data) {
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

  const list = data.data

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
