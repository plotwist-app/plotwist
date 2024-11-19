'use client'

import { GetUserItem200UserItemStatus } from '@/api/endpoints.schemas'
import {
  useDeleteUserItemId,
  useGetUserItem,
  usePatchUserItemStatusById,
  usePostUserItem,
} from '@/api/user-items'
import { APP_QUERY_CLIENT } from '@/context/app'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { useMediaQuery } from '@/hooks/use-media-query'
import { MediaType } from '@/types/supabase/media-type'
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
import { Clock, Eye, Loader, Pen } from 'lucide-react'
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

  const createUserItem = usePostUserItem()
  const editUserItem = usePatchUserItemStatusById()
  const deleteUserItem = useDeleteUserItemId()

  const { data, isLoading, queryKey } = useGetUserItem(
    {
      mediaType,
      tmdbId: String(tmdbId),
    },
    { query: { enabled: Boolean(user), select: (data) => data.userItem } },
  )

  const handleStatusChange = async (
    newStatus: GetUserItem200UserItemStatus,
  ) => {
    if (!user) {
      return push(`/${language}/sign-in`)
    }

    if (!data) {
      await createUserItem.mutateAsync(
        {
          data: { mediaType, tmdbId, status: newStatus },
        },
        {
          onSettled: (response) => {
            if (response) {
              APP_QUERY_CLIENT.setQueryData(queryKey, response)
            }
          },
        },
      )

      return
    }

    if (newStatus === data.status) {
      await deleteUserItem.mutateAsync(
        { id: data.id },
        {
          onSettled: () => {
            APP_QUERY_CLIENT.resetQueries({
              queryKey,
            })
          },
        },
      )

      return
    }

    await editUserItem.mutateAsync(
      { data: { status: newStatus }, id: data.id },
      {
        onSettled: (response) => {
          if (response) {
            APP_QUERY_CLIENT.setQueryData(queryKey, response)
          }
        },
      },
    )
  }

  const isDisabled =
    isLoading ||
    createUserItem.isPending ||
    editUserItem.isPending ||
    deleteUserItem.isPending

  const trigger = (
    <Button
      size="sm"
      variant={data ? 'default' : 'outline'}
      disabled={isDisabled}
    >
      {data?.status === 'WATCHED' && (
        <>
          <Eye className="mr-2" size={14} />
          {dictionary.watched}
        </>
      )}

      {data?.status === 'WATCHING' && (
        <>
          <Loader className="mr-2" size={14} />
          {dictionary.watching}
        </>
      )}

      {data?.status === 'WATCHLIST' && (
        <>
          <Clock className="mr-2" size={14} />
          {dictionary.watching}
        </>
      )}

      {!data && (
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
            Status
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuCheckboxItem
            onCheckedChange={() => handleStatusChange('WATCHED')}
            checked={data?.status === 'WATCHED'}
            disabled={isDisabled}
          >
            {dictionary.watched}
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            onCheckedChange={() => handleStatusChange('WATCHING')}
            checked={data?.status === 'WATCHING'}
            disabled={isDisabled}
          >
            {dictionary.watching}
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            onCheckedChange={() => handleStatusChange('WATCHLIST')}
            checked={data?.status === 'WATCHLIST'}
            disabled={isDisabled}
          >
            {dictionary.watchlist}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>

      <DrawerContent aria-describedby="" className="text-center">
        <DrawerTitle className="my-4">Update Status</DrawerTitle>

        <div className="grid grid-cols-3 gap-2 px-4 mb-4">
          <Button
            variant={data?.status === 'WATCHED' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('WATCHED')}
            disabled={isDisabled}
          >
            {dictionary.watched}
          </Button>

          <Button
            variant={data?.status === 'WATCHING' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('WATCHING')}
            disabled={isDisabled}
          >
            {dictionary.watching}
          </Button>

          <Button
            variant={data?.status === 'WATCHLIST' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('WATCHLIST')}
            disabled={isDisabled}
          >
            {dictionary.watchlist}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
