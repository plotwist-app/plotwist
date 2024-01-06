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
import {
  LISTS_QUERY_CLIENT,
  LISTS_QUERY_KEY,
  useLists,
} from '@/context/lists/lists'
import { ListItem, ListItemStatus } from '@/types/lists'

type ListItemActionsProps = { listItem: ListItem }

export const ListItemActions = ({ listItem }: ListItemActionsProps) => {
  const {
    handleChangeListItemStatus,
    handleChangeListCoverPath,
    handleRemoveToList,
  } = useLists()

  const handleRemove = useCallback(
    async (id: number, listId: number) => {
      await handleRemoveToList.mutateAsync(id, {
        onSuccess: () => {
          LISTS_QUERY_CLIENT.invalidateQueries({
            queryKey: [listId],
          })

          toast.success(`Removed successfully.`)
        },
      })
    },
    [handleRemoveToList],
  )

  const handleChangeStatus = useCallback(
    async (status: ListItemStatus) => {
      await handleChangeListItemStatus.mutateAsync(
        {
          listItemId: listItem.id,
          newStatus: status,
        },
        {
          onSuccess: () => {
            LISTS_QUERY_CLIENT.invalidateQueries({
              queryKey: [listItem.list_id],
            })
          },
        },
      )
    },
    [handleChangeListItemStatus, listItem.id, listItem.list_id],
  )

  const handleChangeBackdrop = useCallback(async () => {
    await handleChangeListCoverPath.mutateAsync(
      {
        listId: listItem.list_id,
        newCoverPath: listItem.backdrop_path,
      },
      {
        onSuccess: () => {
          LISTS_QUERY_CLIENT.invalidateQueries({
            queryKey: [listItem.list_id],
          })

          LISTS_QUERY_CLIENT.invalidateQueries({
            queryKey: LISTS_QUERY_KEY,
          })

          toast.success(`Cover changed successfully.`)
        },
      },
    )
  }, [handleChangeListCoverPath, listItem.backdrop_path, listItem.list_id])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button size="icon" variant="ghost" className="h-6 w-6">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleChangeBackdrop()}>
          Use as cover
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>

          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={listItem.status}
              onValueChange={(status) =>
                handleChangeStatus(status as ListItemStatus)
              }
            >
              {['PENDING', 'WATCHING', 'WATCHED'].map((status) => (
                <DropdownMenuRadioItem
                  key={status}
                  value={status}
                  className="text-sm capitalize"
                >
                  {status.toLowerCase()}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => handleRemove(listItem.id, listItem.list_id)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
