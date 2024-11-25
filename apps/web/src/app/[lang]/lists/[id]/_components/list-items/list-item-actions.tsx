'use client'

import { Trash } from 'lucide-react'

import { Button } from '@plotwist/ui/components/ui/button'

import { useLanguage } from '@/context/language'
import { useListMode } from '@/context/list-mode'

import {
  getGetListItemsByListIdQueryKey,
  useDeleteListItemId,
} from '@/api/list-item'
import { APP_QUERY_CLIENT } from '@/context/app'
import type { ListItem } from '@/types/supabase/lists'
import { toast } from 'sonner'

type ListItemActionsProps = {
  listItem: ListItem
}

export const ListItemActions = ({ listItem }: ListItemActionsProps) => {
  const deleteListItem = useDeleteListItemId()

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
              await APP_QUERY_CLIENT.invalidateQueries({
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
