import { APP_QUERY_CLIENT } from '@/context/app'
import { useLanguage } from '@/context/language'
import { cloneList } from '@/services/api/lists/clone-list'
import { likeList, removeLike } from '@/services/api/lists/like-list'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export const useList = () => {
  const { language, dictionary } = useLanguage()
  const { push } = useRouter()

  const handleLike = useMutation({
    mutationFn: likeList,
    onSettled: async (listId) => {
      await APP_QUERY_CLIENT.invalidateQueries({
        queryKey: ['list', listId],
      })

      await APP_QUERY_CLIENT.invalidateQueries({
        queryKey: ['popular-lists'],
      })
    },
  })

  const handleRemoveLike = useMutation({
    mutationFn: removeLike,
    onSettled: async () => {
      await APP_QUERY_CLIENT.invalidateQueries({
        queryKey: ['list'],
      })

      await APP_QUERY_CLIENT.invalidateQueries({
        queryKey: ['popular-lists'],
      })
    },
  })

  const handleCloneList = useMutation({
    mutationFn: cloneList,
    onSettled: async (newListId) => {
      if (newListId) {
        await APP_QUERY_CLIENT.invalidateQueries({
          queryKey: ['popular-lists'],
        })

        return toast.success(dictionary.list_cloned_successfully, {
          action: {
            label: dictionary.see_list,
            onClick: () => push(`/${language}/lists/${newListId}`),
          },
        })
      }

      toast.error(dictionary.unable_to_clone_list)
    },
  })

  return { handleLike, handleRemoveLike, handleCloneList }
}
