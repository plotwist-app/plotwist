import { supabase } from '@/services/supabase'
import { List } from '@/types/supabase/lists'

export const fetchListsService = async (userId?: string) => {
  if (!userId) return undefined

  const { data } = await supabase
    .from('lists')
    .select('*, list_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .returns<List[]>()

  return data
}
