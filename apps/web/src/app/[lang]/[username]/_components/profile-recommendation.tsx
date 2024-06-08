import { formatDistanceToNow } from 'date-fns'
import { X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

import { useLanguage } from '@/context/language'
import { locale } from '@/utils/date/locale'
import { tmdbImage } from '@/utils/tmdb/image'

import { DetailedRecommendation } from '@/types/supabase/recommendation'
import { useRecommendations } from '@/hooks/use-recommendations'
import { ListsDropdown } from '@/components/lists'
import { Skeleton } from '@/components/ui/skeleton'

type ProfileRecommendationProps = {
  recommendation: DetailedRecommendation
  variant: 'receiver' | 'sender'
}

export const ProfileRecommendation = ({
  recommendation,
  variant,
}: ProfileRecommendationProps) => {
  const { language, dictionary } = useLanguage()
  const { handleDelete } = useRecommendations()

  const time = `${formatDistanceToNow(new Date(recommendation.created_at), {
    locale: locale[language],
  })} ${dictionary.ago}`

  const senderProfile = `/${language}/${recommendation.sender_profile.username}`
  const receiverProfile = `/${language}/${recommendation.sender_profile.username}`

  return (
    <div className="flex items-start gap-2 px-4 [&:not(:first-child)]:pt-4">
      <Link href={senderProfile}>
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
      </Link>

      <div className="flex-1 space-y-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <p className="text-sm">
            <Link href={senderProfile} className="hover:underline">
              {recommendation.sender_profile.username}{' '}
            </Link>

            {variant === 'sender' && (
              <>
                <span className="text-muted-foreground">
                  {dictionary.sent_to}{' '}
                </span>

                <Link href={receiverProfile} className="hover:underline">
                  {recommendation.receiver_profile.username}
                </Link>
              </>
            )}
          </p>

          <div className="hidden size-1 rounded-full bg-muted md:block" />
          <span className="hidden text-sm text-muted-foreground md:block">
            {time}
          </span>
        </div>

        <figure className="relative aspect-poster w-1/2 overflow-hidden rounded-md border bg-muted shadow md:w-1/4">
          <Link
            href={`/${language}/${recommendation.media_type === 'MOVIE' ? 'movies' : 'tv-series'}/${recommendation.tmdb_id}`}
          >
            {recommendation.tmdb_item.poster_path && (
              <Image
                src={tmdbImage(recommendation.tmdb_item.poster_path)}
                fill
                alt=""
              />
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
            {variant === 'receiver' && (
              <ListsDropdown item={recommendation.tmdb_item} className="h-8" />
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDelete.mutate(recommendation.id)}
              disabled={handleDelete.isPending}
            >
              <X size={12} className="mr-2" />

              {variant === 'sender'
                ? dictionary.cancel_shipping
                : dictionary.delete}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const ProfileRecommendationSkeleton = () => {
  return (
    <div className="flex items-start gap-2 px-4 [&:not(:first-child)]:pt-4">
      <Skeleton className="size-8 rounded-full" />

      <div className="flex-1 space-y-2">
        <Skeleton className="h-[1.5ex] w-[15ch]" />
        <Skeleton className="md:1/4 aspect-poster w-1/2" />

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Skeleton className="h-[4ex] w-[30ch]" />

          <div className="flex gap-1">
            <Skeleton className="h-8 w-[10ch]" />
            <Skeleton className="h-8 w-[10ch]" />
          </div>
        </div>
      </div>
    </div>
  )
}
