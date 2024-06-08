'use server'

import { supabase } from '@/services/supabase'
import { DetailedRecommendation } from '@/types/supabase/recommendation'
import { Language, tmdb } from '@plotwist/tmdb'

type Options = {
  userId: string
  variant: 'receiver' | 'sender'
  language: Language
}

export const getRecommendations = async ({
  userId,
  variant = 'receiver',
  language,
}: Options) => {
  const { data: rawRecommendations, error } = await supabase
    .from('recommendations')
    .select(
      '*, receiver_profile:profiles!recommendations_receiver_user_id_fkey(*), sender_profile:profiles!recommendations_sender_user_id_fkey(*)',
    )
    .order('created_at', { ascending: false })
    .eq(variant === 'receiver' ? 'receiver_user_id' : 'sender_user_id', userId)
    .returns<Array<DetailedRecommendation>>()

  if (error) throw new Error(error.message)

  const recommendations = await Promise.all(
    rawRecommendations.map(async (recommendation) => {
      if (recommendation.media_type === 'MOVIE') {
        const movie = await tmdb.movies.details(
          recommendation.tmdb_id,
          language,
        )

        return {
          ...recommendation,
          tmdb_item: movie,
        }
      }

      const tv = await tmdb.tv.details(recommendation.tmdb_id, language)
      return {
        ...recommendation,
        tmdb_item: tv,
      }
    }),
  )

  return recommendations
}
