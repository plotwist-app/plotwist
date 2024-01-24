import { CreateNewListParams } from '@/context/lists'
import { supabase } from '@/services/supabase'
import { List } from '@/types/supabase/lists'

export const fetchLists = async (userId: string) =>
  await supabase
    .from('lists')
    .select('*, list_items(*)')
    .eq('user_id', userId)
    .order('id', { ascending: true })
    .returns<List[]>()

export const createList = async ({
  userId,
  ...values
}: CreateNewListParams) => {
  const { error, data } = await supabase.from('lists').insert({
    user_id: userId,
    ...values,
  })

  if (error) throw new Error(error.message)
  return data
}
