'use client'

import { ReviewItem } from '@/components/reviews/review-item/review-item'
import { useLanguage } from '@/context/language'

const MOCK_REVIEWS = [
  {
    id: '1',
    review:
      'Esse episódio foi absolutamente incrível! O desenvolvimento dos personagens foi perfeito e as reviravoltas me mantiveram grudado na tela. Adorei especialmente como eles conduziram o conflito principal.',
    rating: 5,
    hasSpoilers: false,
    createdAt: '2024-03-20T10:00:00Z',
    user: {
      id: '123',
      username: 'seriemaniatico',
      avatarUrl: null,
    },
    userId: '123',
    likeCount: 42,
    replyCount: 5,
    language: 'pt-BR',
    mediaType: 'TV_SHOW',
    tmdbId: 12345,
    userLike: null,
  },
  {
    id: '2',
    review:
      'ALERTA DE SPOILER: Não acredito que eles mataram aquele personagem! Mas a forma como a cena foi filmada foi magistral.',
    rating: 4,
    hasSpoilers: false,
    createdAt: '2024-03-19T15:30:00Z',
    user: {
      id: '456',
      username: 'criticodetv',
      avatarUrl: null,
    },
    userId: '456',
    likeCount: 28,
    replyCount: 3,
    language: 'pt-BR',
    mediaType: 'TV_SHOW',
    tmdbId: 12345,
    userLike: null,
  },
  {
    id: '3',
    review:
      'O ritmo ficou um pouco estranho nesse episódio. Embora a atuação tenha sido excelente como sempre, algumas cenas se arrastaram mais do que o necessário.',
    rating: 3,
    hasSpoilers: false,
    createdAt: '2024-03-18T20:15:00Z',
    user: {
      id: '789',
      username: 'avaliadorsincero',
      avatarUrl: null,
    },
    userId: '789',
    likeCount: 15,
    replyCount: 2,
    language: 'pt-BR',
    mediaType: 'TV_SHOW',
    tmdbId: 12345,
    userLike: null,
  },
] as const

export function EpisodeReviews() {
  const { dictionary } = useLanguage()

  return (
    <div className="border flex items-center justify-center rounded-md p-4 relative">
      <div className="space-y-8 blur-[3px] select-none">
        {MOCK_REVIEWS.map(review => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>

      <p className="text-sm text-muted-foreground absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        {dictionary.coming_soon}
      </p>
    </div>
  )
}
