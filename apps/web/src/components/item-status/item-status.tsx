'use client'

import type { GetUserItem200UserItemStatus } from '@/api/endpoints.schemas'
import { getGetUserEpisodesQueryKey } from '@/api/user-episodes'
import {
  useDeleteUserItemId,
  useGetUserItem,
  usePutUserItem,
} from '@/api/user-items'
import { APP_QUERY_CLIENT } from '@/context/app'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { useMediaQuery } from '@/hooks/use-media-query'
import type { MediaType } from '@/types/media-type'
import { Button } from '@plotwist/ui/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@plotwist/ui/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@plotwist/ui/components/ui/dropdown-menu'
import { Clock, Eye, Loader, Pen, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'

type ItemStatusProps = {
  mediaType: MediaType
  tmdbId: number
}

export function ItemStatus({ mediaType, tmdbId }: ItemStatusProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { user } = useSession()
  const { push } = useRouter()
  const { language, dictionary } = useLanguage()

  const putUserItem = usePutUserItem()
  const deleteUserItem = useDeleteUserItemId()

  const { data, isLoading, queryKey } = useGetUserItem(
    {
      mediaType,
      tmdbId: String(tmdbId),
    },
    { query: { enabled: Boolean(user) } }
  )

  const userItem = data?.userItem

  const handleStatusChange = async (
    newStatus: GetUserItem200UserItemStatus
  ) => {
    if (!user) {
      return push(`/${language}/sign-in`)
    }

    if (newStatus === userItem?.status) {
      await deleteUserItem.mutateAsync(
        { id: userItem.id },
        {
          onSettled: async () => {
            await APP_QUERY_CLIENT.invalidateQueries({
              queryKey: getGetUserEpisodesQueryKey({
                tmdbId: String(tmdbId),
              }),
            })

            APP_QUERY_CLIENT.resetQueries({
              queryKey,
            })
          },
        }
      )
      return
    }

    await putUserItem.mutateAsync(
      {
        data: { mediaType, tmdbId, status: newStatus },
      },
      {
        onSettled: async response => {
          if (response) {
            await APP_QUERY_CLIENT.invalidateQueries({
              queryKey: getGetUserEpisodesQueryKey({
                tmdbId: String(tmdbId),
              }),
            })

            APP_QUERY_CLIENT.setQueryData(queryKey, response)
          }
        },
      }
    )
  }

  const isDisabled = isLoading || putUserItem.isPending

  const trigger = (
    <Button
      size="sm"
      variant={data ? 'default' : 'outline'}
      disabled={isDisabled}
    >
      {userItem?.status === 'WATCHED' && (
        <>
          <Eye className="mr-2" size={14} />
          {dictionary.watched}
        </>
      )}

      {userItem?.status === 'WATCHING' && (
        <>
          <Loader className="mr-2" size={14} />
          {dictionary.watching}
        </>
      )}

      {userItem?.status === 'WATCHLIST' && (
        <>
          <Clock className="mr-2" size={14} />
          {dictionary.watchlist}
        </>
      )}

      {userItem?.status === 'DROPPED' && (
        <>
          <Trash className="mr-2" size={14} />
          {dictionary.dropped}
        </>
      )}

      {!userItem && (
        <>
          <Pen className="mr-2" size={14} />
          {dictionary.update_status}
        </>
      )}
    </Button>
  )

  if (isDesktop) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel className="flex justify-between">
            {dictionary.update_status}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuCheckboxItem
            onCheckedChange={() => handleStatusChange('WATCHED')}
            checked={userItem?.status === 'WATCHED'}
            disabled={isDisabled}
          >
            {dictionary.watched}
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            onCheckedChange={() => handleStatusChange('WATCHING')}
            checked={userItem?.status === 'WATCHING'}
            disabled={isDisabled}
          >
            {dictionary.watching}
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            onCheckedChange={() => handleStatusChange('WATCHLIST')}
            checked={userItem?.status === 'WATCHLIST'}
            disabled={isDisabled}
          >
            {dictionary.watchlist}
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            onCheckedChange={() => handleStatusChange('DROPPED')}
            checked={userItem?.status === 'DROPPED'}
            disabled={isDisabled}
          >
            {dictionary.dropped}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>

      <DrawerContent
        aria-describedby={dictionary.update_status}
        className="text-center"
      >
        <DrawerTitle className="my-4">{dictionary.update_status}</DrawerTitle>

        <div className="grid grid-cols-2 gap-2 px-4 mb-4">
          <Button
            variant={userItem?.status === 'WATCHED' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('WATCHED')}
            disabled={isDisabled}
          >
            {dictionary.watched}
          </Button>

          <Button
            variant={userItem?.status === 'WATCHING' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('WATCHING')}
            disabled={isDisabled}
          >
            {dictionary.watching}
          </Button>

          <Button
            variant={userItem?.status === 'WATCHLIST' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('WATCHLIST')}
            disabled={isDisabled}
          >
            {dictionary.watchlist}
          </Button>

          <Button
            variant={userItem?.status === 'DROPPED' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('DROPPED')}
            disabled={isDisabled}
          >
            {dictionary.dropped}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
