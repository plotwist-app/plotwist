import { CreateNewListParams } from '@/context/lists'
import { supabase } from '@/services/supabase'

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
