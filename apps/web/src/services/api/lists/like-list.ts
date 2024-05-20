import { supabase } from '@/services/supabase'

type Params = { listId: string; userId: string }

export const likeList = async ({ listId, userId }: Params) => {
  await supabase.from('list_likes').insert({
    list_id: listId,
    user_id: userId,
  })

  return listId
}

export const removeLike = async (id: string) => {
  await supabase.from('list_likes').delete().eq('id', id)

  return id
}
