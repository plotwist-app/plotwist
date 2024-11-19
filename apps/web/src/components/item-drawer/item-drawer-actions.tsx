import { GetUserItem200UserItemStatus } from '@/api/endpoints.schemas'
import {
  useDeleteUserItemId,
  useGetUserItem,
  usePatchUserItemStatusById,
  usePostUserItem,
} from '@/api/user-items'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { cn } from '@/lib/utils'
import { Clock, Eye, Image, Loader, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ComponentProps, PropsWithChildren } from 'react'
import { ItemDrawerProps } from './item-drawer'
import { APP_QUERY_CLIENT } from '@/context/app'

type ItemDrawerMainActionProps = ComponentProps<'div'> & {
  isActive: boolean
  isDisabled: boolean
}

function ItemDrawerMainAction({
  isActive,
  isDisabled,
  ...props
}: ItemDrawerMainActionProps) {
  return (
    <div
      className={cn(
        'text-center flex items-center justify-center gap-2 text-sm cursor-pointer p-2 border-r border-dashed',
        isActive &&
          'dark:bg-foreground dark:text-background bg-zinc-950 text-white',
        isDisabled && 'opacity-50 pointer-events-none',
      )}
      {...props}
    />
  )
}

type ItemDrawerActionProps = { isDisabled?: boolean } & PropsWithChildren
function ItemDrawerAction({ children, isDisabled }: ItemDrawerActionProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm border-b border-dashed px-4 py-3',
        isDisabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {children}
    </div>
  )
}

export function ItemDrawerActions({ mediaType, tmdbId }: ItemDrawerProps) {
  const create = usePostUserItem()
  const edit = usePatchUserItemStatusById()
  const deleteUserItem = useDeleteUserItemId()

  const { user } = useSession()
  const { push } = useRouter()
  const { language, dictionary } = useLanguage()

  const { data, isLoading, queryKey } = useGetUserItem(
    {
      mediaType,
      tmdbId: String(tmdbId),
    },
    { query: { enabled: Boolean(user) } },
  )

  const handleStatusChange = (newStatus: GetUserItem200UserItemStatus) => {
    if (!user) {
      return push(`/${language}/sign-in`)
    }

    if (!data?.userItem) {
      return create.mutate(
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
    }

    const { userItem } = data

    if (newStatus === userItem.status) {
      return deleteUserItem.mutate(
        { id: userItem.id },
        {
          onSettled: () => {
            APP_QUERY_CLIENT.resetQueries({
              queryKey,
            })
          },
        },
      )
    }

    return edit.mutate(
      { data: { status: newStatus }, id: data.userItem.id },
      {
        onSettled: (response) => {
          if (response) {
            APP_QUERY_CLIENT.setQueryData(queryKey, response)
          }
        },
      },
    )
  }

  return (
    <div className="lg:p-0">
      <div className="grid grid-cols-3 border-y border-dashed">
        <ItemDrawerMainAction
          isActive={data?.userItem?.status === 'WATCHED'}
          onClick={() => handleStatusChange('WATCHED')}
          isDisabled={isLoading}
        >
          <Eye size={20} />
          {dictionary.watched}
        </ItemDrawerMainAction>

        <ItemDrawerMainAction
          isActive={data?.userItem?.status === 'WATCHING'}
          onClick={() => handleStatusChange('WATCHING')}
          isDisabled={isLoading}
        >
          <Loader size={20} />
          {dictionary.watching}
        </ItemDrawerMainAction>

        <ItemDrawerMainAction
          isActive={data?.userItem?.status === 'WATCHLIST'}
          onClick={() => handleStatusChange('WATCHLIST')}
          isDisabled={isLoading}
        >
          <Clock size={20} />
          {dictionary.watchlist}
        </ItemDrawerMainAction>
      </div>

      <div className="">
        {/* <ItemDrawerAction isDisabled>
          <List size={16} />
          Add to list
        </ItemDrawerAction> */}

        <ItemDrawerAction isDisabled>
          <Star size={16} />
          Add to Favorites
        </ItemDrawerAction>

        <ItemDrawerAction isDisabled>
          <Image size={16} />
          Change poster image
        </ItemDrawerAction>

        <ItemDrawerAction isDisabled>
          <Image size={16} />
          Change banner image
        </ItemDrawerAction>
      </div>
    </div>
  )
}
