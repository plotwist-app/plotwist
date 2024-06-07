import { formatDistanceToNow } from 'date-fns'
import { Check, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { useLanguage } from '@/context/language'
import { locale } from '@/utils/date/locale'
import { tmdbImage } from '@/utils/tmdb/image'

import { DetailedRecommendation } from '@/types/supabase/recommendation'

type ProfileRecommendationProps = { recommendation: DetailedRecommendation }

export const ProfileRecommendation = ({
  recommendation,
}: ProfileRecommendationProps) => {
  const { language, dictionary } = useLanguage()
  const time = `${formatDistanceToNow(new Date(recommendation.created_at), {
    locale: locale[language],
  })} ${dictionary.ago}`

  return (
    <div className="flex items-start gap-2 [&:not(:first-child)]:pt-4">
      <Avatar className="size-8 border text-[10px] shadow">
        {recommendation.sender_profile.image_path && (
          <AvatarImage
            src={tmdbImage(recommendation.sender_profile.image_path, 'w500')}
            className="object-cover"
          />
        )}

        <AvatarFallback>
          {recommendation.sender_profile.username[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {recommendation.sender_profile.username}
          </p>

          <Separator orientation="vertical" className="h-3" />

          <span className="text-xs text-muted-foreground">{time}</span>
        </div>

        <figure className="relative aspect-[2/3] w-1/2 overflow-hidden rounded-md border bg-muted shadow md:w-1/4">
          <Link
            href={`/${language}/${recommendation.media_type === 'MOVIE' ? 'movies' : 'tv-series'}/${recommendation.tmdb_id}`}
          >
            {recommendation.poster_path && (
              <Image src={tmdbImage(recommendation.poster_path)} fill alt="" />
            )}
          </Link>
        </figure>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {recommendation.message && (
            <div className="rounded-lg border bg-muted/50 px-4 py-2 text-xs">
              {recommendation.message}
            </div>
          )}

          <div className="flex gap-1">
            <Button size="icon" className="h-8 w-8" variant="outline">
              <Check size={12} />
            </Button>

            <Button size="icon" className="h-8 w-8" variant="outline">
              <X size={12} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}