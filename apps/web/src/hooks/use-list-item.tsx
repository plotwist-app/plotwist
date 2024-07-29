import { APP_QUERY_CLIENT } from '@/context/app'
import { useLanguage } from '@/context/language'
import { deleteListItem } from '@/services/api/list-items/delete'
import { List, ListItem } from '@/types/supabase/lists'
import { listPageQueryKey } from '@/utils/list'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useListItem = (listItem: ListItem) => {
  const { dictionary } = useLanguage()

  const updateListItems = (previous: List) => {
    const newListItems = previous.list_items.filter(
      (item) => item.id !== listItem.id,
    )

    const newQuery = {
      ...previous,
      list_items: newListItems,
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

  return { handleDelete }
}
