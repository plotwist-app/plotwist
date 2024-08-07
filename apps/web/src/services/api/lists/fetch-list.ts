import { supabase } from '@/services/supabase'
import { List } from '@/types/supabase/lists'

export const fetchList = async (id: string) => {
  const { data } = await supabase
    .from('lists')
    .select('*, list_items(*, id), list_likes(*, id)')
    .eq('id', id)
    .order('order', { ascending: true, foreignTable: 'list_items' })
    .single<List>()

  return data
}
