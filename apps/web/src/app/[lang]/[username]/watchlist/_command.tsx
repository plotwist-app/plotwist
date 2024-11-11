'use client'

import { GetWatchlistItems200Item } from '@/api/endpoints.schemas'
import {
  getGetWatchlistItemsQueryKey,
  usePostWatchlistItem,
} from '@/api/watchlist'
import { ListCommand } from '@/components/list-command'
import { APP_QUERY_CLIENT } from '@/context/app'
import { useLanguage } from '@/context/language'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

type WatchListCommandProps = {
  items: GetWatchlistItems200Item[]
}

export function WatchListCommand({ items }: WatchListCommandProps) {
  const create = usePostWatchlistItem()
  const { language } = useLanguage()

  return (
    <ListCommand
      items={items}
      onAdd={(tmdbId, mediaType) =>
        create.mutate(
          { data: { tmdbId, mediaType } },
          {
            onSuccess: async () => {
              await APP_QUERY_CLIENT.invalidateQueries({
                queryKey: getGetWatchlistItemsQueryKey({ language }),
              })

              toast.success('item adicionado na watchlist')
            },
          },
        )
      }
      onRemove={() => console.log('remove')}
    >
      <div className="flex aspect-poster cursor-pointer items-center justify-center rounded-md border border-dashed">
        <Plus />
      </div>
    </ListCommand>
  )
}
