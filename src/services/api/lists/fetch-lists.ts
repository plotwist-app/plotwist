import { supabase } from '@/services/supabase'
import { List } from '@/types/supabase/lists'

export const fetchListsService = async (userId?: string) => {
  if (!userId) return []

  return await supabase
    .from('lists')
    .select('*, list_items(*)')
    .eq('user_id', userId)
    .order('id', { ascending: true })
    .returns<List[]>()
}
