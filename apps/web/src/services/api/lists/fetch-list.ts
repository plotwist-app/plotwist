import { supabase } from '@/services/supabase'
import { List } from '@/types/supabase/lists'

export const fetchList = async (id: string) => {
  const response = await supabase
    .from('lists')
    .select('*, list_items(*, id)')
    .eq('id', id)
    .order('created_at', { referencedTable: 'list_items' })
    .single<List>()

  return response
}
