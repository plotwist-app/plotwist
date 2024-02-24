import { useCallback } from 'react'
import { toast } from 'sonner'
import { MoreVertical } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LISTS_QUERY_KEY, useLists } from '@/context/lists'
import { List, ListItem, ListItemStatus } from '@/types/supabase/lists'
import { APP_QUERY_CLIENT } from '@/context/app/app'
import { useLanguage } from '@/context/language'
import { listPageQueryKey } from '@/utils/list'

type ListItemActionsProps = { listItem: ListItem }

export const ListItemActions = ({ listItem }: ListItemActionsProps) => {
  const {
    handleChangeListItemStatus,
    handleChangeListCoverPath,
    handleRemoveFromList,
  } = useLists()

  const { dictionary } = useLanguage()

  const handleRemove = useCallback(
    async (id: string, listId: string) => {
      await handleRemoveFromList.mutateAsync(id, {
        onSuccess: () => {
          APP_QUERY_CLIENT.setQueryData(
            listPageQueryKey(listId),
            (query: { data: List }) => {
              const newListItems = query.data.list_items.filter(
                (item) => item.id !== id,
              )

              return {
                ...query,
                data: {
                  ...query.data,
                  list_items: newListItems,
                },
              }
            },
          )

          toast.success(dictionary.list_item_actions.removed_successfully)
        },
      })
    },
    [dictionary, handleRemoveFromList],
  )

  const handleChangeStatus = useCallback(
    async (status: ListItemStatus, listId: string) => {
      const variables = {
        listItemId: listItem.id,
        newStatus: status,
      }

      await handleChangeListItemStatus.mutateAsync(variables, {
        onSuccess: () => {
          APP_QUERY_CLIENT.setQueryData(
            listPageQueryKey(listId),
            (query: { data: List }) => {
              const newListItems = query.data.list_items.map((item) => {
                if (item.id === variables.listItemId) {
                  return {
                    ...item,
                    status: variables.newStatus,
                  }
                }

                return item
              })

              const newQuery = {
                ...query,
                data: {
                  ...query.data,
                  list_items: newListItems,
                },
              }

              return newQuery
            },
          )
        },
      })
    },
    [handleChangeListItemStatus, listItem],
  )

  const handleChangeBackdrop = useCallback(async () => {
    const variables = {
      listId: listItem.list_id,
      newCoverPath: listItem.backdrop_path,
    }

    await handleChangeListCoverPath.mutateAsync(variables, {
      onSuccess: () => {
        APP_QUERY_CLIENT.setQueryData(
          listPageQueryKey(listItem.list_id),
          (query: { data: List }) => {
            const newQuery = {
              ...query,
              data: {
                ...query.data,
                cover_path: variables.newCoverPath,
              },
            }

            return newQuery
          },
        )

        APP_QUERY_CLIENT.setQueryData(
          LISTS_QUERY_KEY,
          (query: { data: List[] }) => {
            const newData = query.data.map((list) => {
              if (list.id === variables.listId) {
                return {
                  ...list,
                  cover_path: variables.newCoverPath,
                }
              }

              return list
            })

            return { ...query, data: newData }
          },
        )

        toast.success(dictionary.list_item_actions.cover_changed_successfully)
      },
    })
  }, [
    dictionary,
    handleChangeListCoverPath,
    listItem.backdrop_path,
    listItem.list_id,
  ])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button size="icon" variant="ghost" className="h-6 w-6">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleChangeBackdrop()}>
          {dictionary.list_item_actions.use_as_cover}
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {dictionary.list_item_actions.status}
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={listItem.status}
              onValueChange={(status) =>
                handleChangeStatus(status as ListItemStatus, listItem.list_id)
              }
            >
              {['PENDING', 'WATCHING', 'WATCHED'].map((status) => (
                <DropdownMenuRadioItem
                  key={status}
                  value={status}
                  className="text-sm capitalize"
                >
                  {
                    dictionary.statuses[
                      status.toLowerCase() as 'pending' | 'watching' | 'watched'
                    ]
                  }
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => handleRemove(listItem.id, listItem.list_id)}
          >
            {dictionary.list_item_actions.delete}
          </DropdownMenuItem>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
