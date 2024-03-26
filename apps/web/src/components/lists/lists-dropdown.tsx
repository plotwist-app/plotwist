'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useLists } from '@/context/lists'
import { APP_QUERY_CLIENT } from '@/context/app/app'
import { useLanguage } from '@/context/language'
import { ListForm } from '@/app/[lang]/lists/_components/list-form'

import { sanitizeListItem } from '@/utils/tmdb/list/list_item/sanitize'

import { List } from '@/types/supabase/lists'

import { cn } from '@/lib/utils'
import { useAuth } from '@/context/auth'
import { NoAccountTooltip } from '../no-account-tooltip'
import { MovieDetails, TvSerieDetails } from '@plotwist/tmdb'

type ListsDropdownProps = {
  item: MovieDetails | TvSerieDetails
}

export const ListsDropdown = ({ item }: ListsDropdownProps) => {
  const { lists, handleAddToList, handleRemoveFromList } = useLists()
  const { push } = useRouter()
  const { user } = useAuth()
  const {
    dictionary: {
      lists_dropdown: {
        removed_successfully: removedSuccessfully,
        added_successfully: addedSuccessfully,
        view_list: viewList,
        add_to_list: addToList,
        my_lists: myLists,
      },
      list_form: { create_new_list: createNewList },
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
                label: viewList,
                onClick: () => push(`/${language}/lists/${list.id}`),
              },
            })
          },
        },
      )
    },
    [addedSuccessfully, handleAddToList, item, language, push, viewList, user],
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-6 px-2.5 py-0.5 text-xs">
          <Plus className="mr-2" size={12} />
          {addToList}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{myLists}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <Content />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
