'use client'

import {
  getGetUserItemsQueryKey,
  useDeleteUserItemId,
  useGetAllUserItems,
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
  userId: string
} & Pick<UserItemsProps, 'status'>

export function UserItemsCommand({ status, userId }: UserItemsCommandProps) {
  const add = usePutUserItem()
  const remove = useDeleteUserItemId()
  const { refresh } = useRouter()
  const { language, dictionary } = useLanguage()

  const { data, queryKey } = useGetAllUserItems({
    status,
    userId,
  })

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
    DROPPED: {
      add: dictionary.dropped_add,
      remove: dictionary.dropped_removed,
    },
  }

  const items = data?.userItems || []

  const invalidateQueries = async () => {
    await APP_QUERY_CLIENT.invalidateQueries({
      queryKey: getGetUserItemsQueryKey({
        language,
        status,
        userId,
      }),
    })

    await APP_QUERY_CLIENT.invalidateQueries({
      queryKey: queryKey,
    })
  }

  return (
    <ListCommand
      items={items}
      onAdd={(tmdbId, mediaType) =>
        add.mutate(
          { data: { tmdbId, mediaType, status } },
          {
            onSuccess: async () => {
              await invalidateQueries()
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
              await invalidateQueries()
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
