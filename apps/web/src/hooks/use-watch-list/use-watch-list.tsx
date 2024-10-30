import { useMutation, useQuery } from '@tanstack/react-query'

import { APP_QUERY_CLIENT } from '@/context/app'
import {
  getWatchList,
  addItemToWatchList,
  removeItemFromWatchList,
} from '@/services/api/watch-list'

export const useWatchList = ({ userId }: { userId: string }) => {
  const { data } = useQuery({
    queryKey: ['watch-list', userId],
    queryFn: () => getWatchList({ userId }),
  })

  const invalidateQueries = async () => {
    const queries = [['watch-list', userId]]

    await Promise.all(
      queries.map((queryKey) =>
        APP_QUERY_CLIENT.invalidateQueries({
          queryKey,
        }),
      ),
    )
  }

  const handleAddToWatchList = useMutation({
    mutationFn: addItemToWatchList,
    onSuccess: invalidateQueries,
  })

  const handleRemoveFromWatchList = useMutation({
    mutationFn: removeItemFromWatchList,
    onSuccess: invalidateQueries,
  })

  return {
    data,
    handleAddToWatchList,
    handleRemoveFromWatchList,
  }
}
