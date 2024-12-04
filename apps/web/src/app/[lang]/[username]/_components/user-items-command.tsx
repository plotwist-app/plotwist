'use client'

import type { GetUserItems200Item } from '@/api/endpoints.schemas'
import {
  getGetUserItemsQueryKey,
  useDeleteUserItemId,
  usePutUserItem,
} from '@/api/user-items'
import { ListCommand } from '@/components/list-command'
import { APP_QUERY_CLIENT } from '@/context/app'
import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { UserItemsProps } from './user-items'

type UserItemsCommandProps = {
  items: GetUserItems200Item[]
  userId: string
} & Pick<UserItemsProps, 'status'>

export function UserItemsCommand({
  items,
  status,
  userId,
}: UserItemsCommandProps) {
  const add = usePutUserItem()
  const remove = useDeleteUserItemId()
  const { refresh } = useRouter()

  const { language, dictionary } = useLanguage()

  const messages: Record<
    UserItemsCommandProps['status'],
    Record<'add' | 'remove', string>
  > = {
    WATCHED: {
      add: dictionary.watched_added,
      remove: dictionary.watched_removed,
    },
    WATCHING: {
      add: dictionary.watching_added,
      remove: dictionary.watching_removed,
    },
    WATCHLIST: {
      add: dictionary.watchlist_added,
      remove: dictionary.watchlist_removed,
    },
  }

  return (
    <ListCommand
      items={items}
      onAdd={(tmdbId, mediaType) =>
        add.mutate(
          { data: { tmdbId, mediaType, status } },
          {
            onSuccess: async () => {
              await APP_QUERY_CLIENT.invalidateQueries({
                queryKey: getGetUserItemsQueryKey({
                  language,
                  status,
                  userId,
                }),
              })

              toast.success(messages[status].add)
              refresh()
            },
          }
        )
      }
      onRemove={id =>
        remove.mutate(
          { id },
          {
            onSuccess: async () => {
              await APP_QUERY_CLIENT.invalidateQueries({
                queryKey: getGetUserItemsQueryKey({
                  language,
                  status,
                  userId: items[0].userId,
                }),
              })

              toast.success(messages[status].remove)
              refresh()
            },
          }
        )
      }
      isPending={add.isPending || remove.isPending}
    >
      <div
        className={cn(
          'flex aspect-poster cursor-pointer items-center justify-center rounded-md border border-dashed'
        )}
      >
        <Plus />
      </div>
    </ListCommand>
  )
}
