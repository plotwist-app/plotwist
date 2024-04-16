import { APP_QUERY_CLIENT } from '@/context/app'
import { useLanguage } from '@/context/language'
import { deleteListItem } from '@/services/api/list-items/delete'
import { updateListItem } from '@/services/api/list-items/update'
import { List, ListItem, ListItemStatus } from '@/types/supabase/lists'
import { listPageQueryKey } from '@/utils/list'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

type ListQuery = { data: List }

export const useListItem = (listItem: ListItem) => {
  const { dictionary } = useLanguage()

  const updateListItems = (previousQuery: ListQuery) => {
    const newListItems = previousQuery.data.list_items.filter(
      (item) => item.id !== listItem.id,
    )

    const newQuery = {
      ...previousQuery,
      data: {
        ...previousQuery.data,
        list_items: newListItems,
      },
    }

    return newQuery
  }

  const updateListItemsStatus = (
    previousQuery: ListQuery,
    status: ListItemStatus,
  ) => {
    const { data } = previousQuery

    const newListItems = data.list_items.map((item) => {
      if (item.id === listItem.id)
        return {
          ...item,
          status,
        }

      return item
    })

    const newQuery = {
      ...previousQuery,
      data: {
        ...previousQuery.data,
        list_items: newListItems,
      },
    }

    return newQuery
  }

  const handleDelete = useMutation({
    mutationFn: () => deleteListItem(listItem.id),
    onMutate: () => {
      APP_QUERY_CLIENT.setQueryData(
        listPageQueryKey(listItem.list_id),
        updateListItems,
      )

      toast.success(dictionary.list_item_actions.removed_successfully)
    },
  })

  const handleUpdateStatus = useMutation({
    mutationFn: (status: ListItemStatus) =>
      updateListItem(listItem.id, { status }),
    onMutate: (status: ListItemStatus) => {
      APP_QUERY_CLIENT.setQueryData(
        listPageQueryKey(listItem.list_id),
        (previousQuery: ListQuery) =>
          updateListItemsStatus(previousQuery, status),
      )
    },
  })

  return { handleDelete, handleUpdateStatus }
}
