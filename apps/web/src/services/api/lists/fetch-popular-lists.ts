import { supabase } from '@/services/supabase'
import { PopularList } from '@/types/supabase/lists'

export const fetchPopularLists = async () => {
  const { data } = await supabase
    .from('lists')
    .select('*, list_items(*), profiles!inner(*), list_likes(*)')
    .eq('visibility', 'PUBLIC')
    .returns<PopularList[]>()

  return data
    ?.sort((a, b) => b.list_likes.length - a.list_likes.length)
    .slice(0, 5)
}
