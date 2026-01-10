'use client'

import { Button } from '@plotwist/ui/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { Trash } from 'lucide-react'
import { toast } from 'sonner'

import type { GetListItemsByListId200Item } from '@/api/endpoints.schemas'
import {
  getGetListItemsByListIdQueryKey,
  useDeleteListItemId,
} from '@/api/list-item'
import { useLanguage } from '@/context/language'
import { useListMode } from '@/context/list-mode'

type ListItemActionsProps = {
  listItem: GetListItemsByListId200Item
}

export const ListItemActions = ({ listItem }: ListItemActionsProps) => {
  const deleteListItem = useDeleteListItemId()
  const queryClient = useQueryClient()

  const { dictionary, language } = useLanguage()
  const { mode } = useListMode()

  if (mode === 'SHOW') return

  return (
    <Button
      size="icon"
      className="h-6 w-6"
      onClick={event => {
        event.stopPropagation()
        event.nativeEvent.preventDefault()
        event.nativeEvent.stopImmediatePropagation()

        deleteListItem.mutateAsync(
          { id: listItem.id },
          {
            onSuccess: async () => {
              await queryClient.invalidateQueries({
                queryKey: getGetListItemsByListIdQueryKey(listItem.listId, {
                  language,
                }),
              })

              toast.success(dictionary.list_item_actions.removed_successfully)
            },
          }
        )
      }}
    >
      <Trash className="h-3 w-3" />
    </Button>
  )
}
