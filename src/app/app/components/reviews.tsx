'use client'

import { supabase } from '@/services/supabase'
import { MediaType } from '@/types/supabase/media-type'
import { useQuery } from '@tanstack/react-query'

type ReviewsProps = { id: number; mediaType: MediaType }

export const Reviews = ({ id }: ReviewsProps) => {
  const { data } = useQuery({
    queryKey: [id],
    queryFn: async () =>
      supabase
        .from('reviews')
        .select()
        .eq('tmdb_id', id)
        .eq('media_type', 'MOVIE'),
  })

  return <div></div>
}
