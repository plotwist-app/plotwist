'use client'

import { Button } from '@plotwist/ui/components/ui/button'
import { Checkbox } from '@plotwist/ui/components/ui/checkbox'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
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
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type ComponentProps, useCallback } from 'react'
import { toast } from 'sonner'
import { getGetListsQueryKey } from '@/api/list'
import { useDeleteListItemId, usePostListItem } from '@/api/list-item'
import { ListForm } from '@/app/[lang]/lists/_components/list-form'
import { useLanguage } from '@/context/language'
import { useLists } from '@/context/lists'
import { useSession } from '@/context/session'
import { cn } from '@/lib/utils'
import type { MovieDetails, TvSerieDetails } from '@/services/tmdb'
import { NoAccountTooltip } from '../no-account-tooltip'

type ListsDropdownProps = {
  item: MovieDetails | TvSerieDetails
} & ComponentProps<'button'>

export const ListsDropdown = ({ item, ...props }: ListsDropdownProps) => {
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

  const queryClient = useQueryClient()

  const handleRemove = useCallback(
    async (id: string) => {
      if (!user) return

      await deleteListItem.mutateAsync(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: getGetListsQueryKey({ userId: user.id }),
            })

            toast.success(removedSuccessfully)
          },
        }
      )
    },
    [removedSuccessfully, deleteListItem, user, queryClient]
  )

  const handleAdd = useCallback(
    async (listId: string) => {
      if (!user) return

      await postListItem.mutateAsync(
        {
          data: {
            listId: listId,
            tmdbId: item.id,
            mediaType: 'title' in item ? 'MOVIE' : 'TV_SHOW',
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: getGetListsQueryKey({ userId: user.id }),
            })

            toast.success(addedSuccessfully, {
              action: {
                label: seeList,
                onClick: () => push(`/${language}/lists/${listId}`),
              },
            })
          },
        }
      )
    },
    [
      addedSuccessfully,
      item,
      language,
      postListItem,
      push,
      seeList,
      user,
      queryClient,
    ]
  )

  const DesktopContent = () => {
    if (!user) {
      return (
        <NoAccountTooltip>
          <div
            className={cn(
              'flex cursor-not-allowed items-center justify-center rounded-md border border-dashed p-2 text-sm opacity-50'
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
          {lists.map(list => {
            const itemIncluded = list.items.find(
              ({ tmdbId }) => tmdbId === item.id
            )

            return (
              <DropdownMenuCheckboxItem
                className="cursor-pointer"
                key={list.id}
                checked={Boolean(itemIncluded)}
                onClick={() =>
                  itemIncluded
                    ? handleRemove(itemIncluded.id)
                    : handleAdd(list.id)
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

  const MobileContent = () => {
    if (!user) {
      return (
        <NoAccountTooltip>
          <div
            className={cn(
              'flex cursor-not-allowed items-center justify-center rounded-md border border-dashed p-4 text-sm opacity-50'
            )}
          >
            {createNewList}
          </div>
        </NoAccountTooltip>
      )
    }

    if (lists?.length > 0) {
      return (
        <div className="space-y-2">
          {lists.map(list => {
            const itemIncluded = list.items.find(
              ({ tmdbId }) => tmdbId === item.id
            )

            return (
              <Button
                variant="outline"
                key={list.id}
                onClick={() =>
                  itemIncluded
                    ? handleRemove(itemIncluded.id)
                    : handleAdd(list.id)
                }
                className="flex text-left w-full cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <Checkbox checked={Boolean(itemIncluded)} className="h-5 w-5" />
                <span className="flex-1 text-sm font-medium">{list.title}</span>
              </Button>
            )
          })}
        </div>
      )
    }

    return (
      <ListForm
        trigger={
          <div
            className={
              'flex cursor-pointer items-center justify-center rounded-md border border-dashed p-4 text-sm'
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
      <Drawer>
        <DrawerTrigger asChild>
          <Button size="sm" variant="outline" className="md:hidden" {...props}>
            <Plus className="mr-2" size={14} />
            {addToList}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center justify-between">
              {myLists}
              <ListForm
                trigger={
                  <Button
                    size="icon"
                    className="h-8 w-8"
                    variant="outline"
                    disabled={
                      user?.subscriptionType === 'MEMBER' && lists.length === 1
                    }
                  >
                    <Plus className="size-4" />
                  </Button>
                }
              />
            </DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-4">
            <MobileContent />
          </div>
        </DrawerContent>
      </Drawer>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="hidden md:inline-flex"
            {...props}
          >
            <Plus className="mr-2" size={14} />
            {addToList}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel className="flex justify-between">
            {myLists}

            <ListForm
              trigger={
                <Button
                  size="icon"
                  className="h-6 w-6"
                  variant="outline"
                  disabled={
                    user?.subscriptionType === 'MEMBER' && lists.length === 1
                  }
                >
                  <Plus className="size-4" />
                </Button>
              }
            />
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DesktopContent />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
