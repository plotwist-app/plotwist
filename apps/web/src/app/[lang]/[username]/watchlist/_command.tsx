'use client'

import { GetUserItems200Item } from '@/api/endpoints.schemas'
import {
  getGetUserItemsQueryKey,
  useDeleteUserItemId,
  usePostUserItem,
} from '@/api/user-items'
import { ListCommand } from '@/components/list-command'
import { APP_QUERY_CLIENT } from '@/context/app'
import { useLanguage } from '@/context/language'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

type WatchListCommandProps = {
  items: GetUserItems200Item[]
}

export function WatchListCommand({ items }: WatchListCommandProps) {
  const add = usePostUserItem()
  const remove = useDeleteUserItemId()

  const { language, dictionary } = useLanguage()

  return (
    <ListCommand
      items={items}
      onAdd={(tmdbId, mediaType) =>
        add.mutate(
          { data: { tmdbId, mediaType, status: 'WATCHLIST' } },
          {
            onSuccess: async () => {
              await APP_QUERY_CLIENT.invalidateQueries({
                queryKey: getGetUserItemsQueryKey({
                  language,
                  status: 'WATCHLIST',
                }),
              })

              toast.success(dictionary.watchlist_added)
            },
          },
        )
      }
      onRemove={(id) =>
        remove.mutate(
          { id },
          {
            onSuccess: async () => {
              await APP_QUERY_CLIENT.invalidateQueries({
                queryKey: getGetUserItemsQueryKey({
                  language,
                  status: 'WATCHLIST',
                }),
              })

              toast.success(dictionary.watchlist_removed)
            },
          },
        )
      }
    >
      <div className="flex aspect-poster cursor-pointer items-center justify-center rounded-md border border-dashed">
        <Plus />
      </div>
    </ListCommand>
  )
}
