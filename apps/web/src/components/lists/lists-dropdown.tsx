'use client'

import { ComponentProps, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { MovieDetails, TvSerieDetails } from '@plotwist/tmdb'
import { useRouter } from 'next/navigation'

import { Button } from '@plotwist/ui/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@plotwist/ui/components/ui/dropdown-menu'

import { useLists } from '@/context/lists'
import { APP_QUERY_CLIENT } from '@/context/app/app'
import { useLanguage } from '@/context/language'
import { ListForm } from '@/app/[lang]/lists/_components/list-form'

import { sanitizeListItem } from '@/utils/tmdb/list/list_item/sanitize'

import { List } from '@/types/supabase/lists'

import { cn } from '@/lib/utils'
import { NoAccountTooltip } from '../no-account-tooltip'
import { useSession } from '@/context/session'
import { useDeleteListItemId, usePostListItem } from '@/api/list-item'

type ListsDropdownProps = {
  item: MovieDetails | TvSerieDetails
} & ComponentProps<'button'>

export const ListsDropdown = ({
  item,
  className,
  ...props
}: ListsDropdownProps) => {
  const { lists } = useLists()
  const postListItem = usePostListItem()
  const deleteListItem = useDeleteListItemId()

  const { push } = useRouter()
  const { user } = useSession()

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

      await deleteListItem.mutateAsync(
        { id },
        {
          onSuccess: () => {
            APP_QUERY_CLIENT.invalidateQueries({
              queryKey: ['lists', user.id],
            })

            toast.success(removedSuccessfully)
          },
        },
      )
    },
    [removedSuccessfully, deleteListItem, user],
  )

  const handleAdd = useCallback(
    async (list: List) => {
      if (!user) return

      const sanitizedItem = sanitizeListItem(list.id, item)

      await postListItem.mutateAsync(
        { data: sanitizedItem },
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
    [addedSuccessfully, item, language, postListItem, push, seeList, user],
  )

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
            const itemIncluded = list.items.find(
              ({ tmdbId }) => tmdbId === item.id,
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
                {list.title}
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
  )
}
