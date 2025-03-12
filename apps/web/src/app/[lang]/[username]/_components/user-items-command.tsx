'use client'

import {
  getGetUserItemsQueryKey,
  useDeleteUserItemId,
  useGetAllUserItems,
  usePutUserItem,
} from '@/api/user-items'
import { ListCommand } from '@/components/list-command'
import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { UserItemsProps } from './user-items'

type UserItemsCommandProps = {
  userId: string
  filters: UserItemsProps['filters']
}

export function UserItemsCommand({ filters, userId }: UserItemsCommandProps) {
  const add = usePutUserItem()
  const remove = useDeleteUserItemId()
  const { refresh } = useRouter()
  const { language, dictionary } = useLanguage()
  const queryClient = useQueryClient()

  const status = filters.status

  const { data, queryKey } = useGetAllUserItems({
    status,
    userId,
  })

  const messages: Record<
    NonNullable<UserItemsCommandProps['filters']['status']>,
    Record<'add' | 'remove', string>
  > = {
    ALL: {
      add: 'aa',
      remove: 'aa',
    },
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
    await queryClient.invalidateQueries({
      queryKey: getGetUserItemsQueryKey({
        language,
        status,
        userId,
        mediaType: filters.mediaType,
        orderBy: filters.orderBy,
      }),
    })

    await queryClient.invalidateQueries({
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
