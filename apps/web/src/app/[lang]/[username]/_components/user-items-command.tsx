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
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { UserItemsProps } from './user-items'
import { useQueryClient } from '@tanstack/react-query'

type UserItemsCommandProps = {
  userId: string
} & Pick<UserItemsProps, 'status'>

export function UserItemsCommand({ status, userId }: UserItemsCommandProps) {
  const add = usePutUserItem()
  const remove = useDeleteUserItemId()
  const { refresh } = useRouter()
  const { language, dictionary } = useLanguage()
  const queryClient = useQueryClient()

  const effectiveStatus = status ?? 'WATCHLIST'

  const { data, queryKey } = useGetAllUserItems({
    status: effectiveStatus,
    userId,
  })

  const messages: Record<
    NonNullable<UserItemsCommandProps['status']>,
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
    await queryClient.invalidateQueries({
      queryKey: getGetUserItemsQueryKey({
        language,
        status: effectiveStatus,
        userId,
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
          { data: { tmdbId, mediaType, status: effectiveStatus } },
          {
            onSuccess: async () => {
              await invalidateQueries()
              toast.success(messages[effectiveStatus].add)
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
              toast.success(messages[effectiveStatus].remove)
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
