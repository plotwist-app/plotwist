'use client'

import { MovieDetails, TvSerieDetails } from '@plotwist/tmdb'
import { ListIcon, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ComponentProps, useCallback } from 'react'
import { toast } from 'sonner'

import { Button } from '@plotwist/ui/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@plotwist/ui/components/ui/dropdown-menu'

import { ListForm } from '@/app/[lang]/lists/_components/list-form'
import { APP_QUERY_CLIENT } from '@/context/app/app'
import { useLanguage } from '@/context/language'
import { useLists } from '@/context/lists'

import { sanitizeListItem } from '@/utils/tmdb/list/list_item/sanitize'

import { List } from '@/types/supabase/lists'

import { useAuth } from '@/context/auth'
import { cn } from '@/lib/utils'
import { NoAccountTooltip } from '../no-account-tooltip'
import { useWatchList } from '@/hooks/use-watch-list'

type ListsDropdownProps = {
  item: MovieDetails | TvSerieDetails
} & ComponentProps<'button'>

export const ListsDropdown = ({
  item,
  className,
  ...props
}: ListsDropdownProps) => {
  const { lists, handleAddToList, handleRemoveFromList } = useLists()
  const { push } = useRouter()
  const { user } = useAuth()

  const {
    dictionary: {
      lists_dropdown: {
        removed_successfully: removedSuccessfully,
        added_successfully: addedSuccessfully,
        my_lists: myLists,
      },
      list_form: { create_new_list: createNewList },
      see_list: seeList,
      add_to_list: addToList,
    },
    language,
  } = useLanguage()

  const handleRemove = useCallback(
    async (id: string) => {
      if (!user) return

      await handleRemoveFromList.mutateAsync(id, {
        onSuccess: () => {
          APP_QUERY_CLIENT.invalidateQueries({
            queryKey: ['lists', user.id],
          })

          toast.success(removedSuccessfully)
        },
      })
    },
    [removedSuccessfully, handleRemoveFromList, user],
  )

  const handleAdd = useCallback(
    async (list: List) => {
      if (!user) return

      const sanitizedItem = sanitizeListItem(list.id, item)

      await handleAddToList.mutateAsync(
        { item: sanitizedItem },
        {
          onSuccess: () => {
            APP_QUERY_CLIENT.invalidateQueries({
              queryKey: ['lists', user.id],
            })

            toast.success(addedSuccessfully, {
              action: {
                label: seeList,
                onClick: () => push(`/${language}/lists/${list.id}`),
              },
            })
          },
        },
      )
    },
    [addedSuccessfully, handleAddToList, item, language, push, seeList, user],
  )

  const { handleAddToWatchList: handleAddToWatchListMutation } = useWatchList({
    userId: user?.id || '',
  })

  const handleAddToWatchList = useCallback(() => {
    if (!user)
      return toast.error('You must be logged in to add to your watchlist')

    handleAddToWatchListMutation.mutate(
      {
        type: 'MOVIE',
        user_id: user.id,
        tmdb_id: item.id.toString(),
      },
      {
        onSuccess: () => {
          APP_QUERY_CLIENT.invalidateQueries({
            queryKey: ['lists', user.id],
          })

          toast.success(addedSuccessfully, {
            action: {
              label: 'Verify my watchlist now',
              onClick: () =>
                push(`/${language}/${user.username}?tab=watch-list`),
            },
          })
        },
        onError: () => {
          toast.error('There was an error adding this movie to your watchlist')
        },
      },
    )
  }, [
    addedSuccessfully,
    handleAddToWatchListMutation,
    item.id,
    language,
    push,
    user,
  ])

  const Content = () => {
    if (!user) {
      return (
        <NoAccountTooltip>
          <div
            className={cn(
              'flex cursor-not-allowed items-center justify-center rounded-md border border-dashed p-2 text-sm opacity-50',
            )}
          >
            {createNewList}
          </div>
        </NoAccountTooltip>
      )
    }

    if (lists?.length > 0) {
      return (
        <>
          {lists.map((list) => {
            const itemIncluded = list.list_items.find(
              ({ tmdb_id: tmdbId }) => tmdbId === item.id,
            )

            return (
              <DropdownMenuCheckboxItem
                className="cursor-pointer"
                key={list.id}
                checked={Boolean(itemIncluded)}
                onClick={() =>
                  itemIncluded ? handleRemove(itemIncluded.id) : handleAdd(list)
                }
              >
                {list.name}
              </DropdownMenuCheckboxItem>
            )
          })}
        </>
      )
    }

    return (
      <ListForm
        trigger={
          <div
            className={
              'flex cursor-pointer items-center justify-center rounded-md border border-dashed p-2 text-sm'
            }
          >
            {createNewList}
          </div>
        }
      />
    )
  }

  return (
    <>
      <Button
        onClick={handleAddToWatchList}
        variant="outline"
        className={cn('h-6 px-2.5 py-0.5 text-xs', className)}
        {...props}
      >
        <ListIcon className="mr-2" size={12} />
        Add to watchlist
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn('h-6 px-2.5 py-0.5 text-xs', className)}
            {...props}
          >
            <Plus className="mr-2" size={12} />
            {addToList}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel className="flex justify-between">
            {myLists}

            <ListForm
              trigger={
                <Button size="icon" className="h-6 w-6" variant="outline">
                  <Plus className="size-4" />
                </Button>
              }
            />
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <Content />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
