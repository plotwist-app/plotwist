import { supabase } from '@/services/supabase'
import { Reply } from '@/types/supabase/reviews'

type UpdateReplyValues = Pick<Reply, 'reply' | 'id'>

export const updateReply = async (values: UpdateReplyValues) => {
  const { reply, id } = values

  const { error, data } = await supabase
    .from('review_replies')
    .update({ reply })
    .eq('id', id)

  if (error) throw new Error(error.message)
  return data
}
