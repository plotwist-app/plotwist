import { supabase } from '@/services/supabase'

export type EditListServiceValues = {
  name: string
  description: string
  visibility: string
  id: string
}

export const editListService = async (values: EditListServiceValues) => {
  const { name, description, id, visibility } = values

  const { error, data } = await supabase
    .from('lists')
    .update({
      name,
      description,
      visibility,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  return data
}
