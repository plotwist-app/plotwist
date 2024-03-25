import { ChangeListCoverPathParams } from '@/context/lists'
import { supabase } from '@/services/supabase'

export const changeListCoverPathService = async ({
  listId,
  newCoverPath,
}: ChangeListCoverPathParams) => {
  const { error, data } = await supabase
    .from('lists')
    .update({ cover_path: newCoverPath })
    .eq('id', listId)

  if (error) throw new Error(error.message)
  return data
}
