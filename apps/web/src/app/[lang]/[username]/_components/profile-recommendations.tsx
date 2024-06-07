import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useLanguage } from '@/context/language'
import { getRecommendations } from '@/services/api/recommendation/get'
import { locale } from '@/utils/date/locale'
import { tmdbImage } from '@/utils/tmdb/image'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Check, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

type ProfileRecommendationsProps = {
  userId: string
}

export const ProfileRecommendations = ({
  userId,
}: ProfileRecommendationsProps) => {
  const [variant, setVariant] = useState<'receiver' | 'sender'>('receiver')

  const { language } = useLanguage()
  const { data } = useQuery({
    queryKey: ['recommendations', userId, variant],
    queryFn: () => getRecommendations({ userId, variant, language }),
  })

  if (!data) return <p>ninguem te recomendou nada.</p>

  return (
    <section className="space-y-4">
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant={variant === 'receiver' ? 'default' : 'outline'}
          onClick={() => setVariant('receiver')}
        >
          Recebidas
        </Button>

        <Button
          size="sm"
          variant={variant === 'sender' ? 'default' : 'outline'}
          onClick={() => setVariant('sender')}
          disabled
        >
          Enviadas
        </Button>
      </div>

      <div className="flex flex-col gap-4 divide-y">
        {data.map((recommendation) => {
          const time = `${formatDistanceToNow(
            new Date(recommendation.created_at),
            {
              locale: locale[language],
            },
          )} atrás`

          return (
            <div
              className="flex items-start gap-2 [&:not(:first-child)]:pt-4"
              key={recommendation.id}
            >
              <Avatar className="size-8 border text-[10px] shadow">
                {recommendation.sender_profile.image_path && (
                  <AvatarImage
                    src={tmdbImage(
                      recommendation.sender_profile.image_path,
                      'w500',
                    )}
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
                      <Image
                        src={tmdbImage(recommendation.poster_path)}
                        fill
                        alt=""
                      />
                    )}
                  </Link>
                </figure>

                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <div className="rounded-lg border bg-muted/50 px-4 py-2 text-xs">
                    Seriously, watch this, best movie in the world.
                  </div>

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
            // <div className="flex items-start gap-4" key={recommendation.id}>
            //   <Link
            //     href={`/${language}/${recommendation.media_type === 'MOVIE' ? 'movies' : 'tv-series'}/${recommendation.tmdb_id}`}
            //     className="w-2/6 md:w-1/6"
            //   >
            //     <figure className="relative aspect-[2/3] overflow-hidden rounded-md border bg-muted shadow">
            //       {recommendation.poster_path && (
            //         <Image
            //           src={tmdbImage(recommendation.poster_path)}
            //           fill
            //           alt=""
            //         />
            //       )}
            //     </figure>
            //   </Link>

            //   <div className="flex-1 space-y-2">
            //     <h4 className="text-lg font-semibold">
            //       {recommendation.title}
            //     </h4>

            //     <div className="flex flex-col gap-1">
            //       <div className="flex items-center gap-2">
            //         <Avatar className="size-8 border text-[10px] shadow">
            //           {recommendation.sender_profile.image_path && (
            //             <AvatarImage
            //               src={tmdbImage(
            //                 recommendation.sender_profile.image_path,
            //                 'w500',
            //               )}
            //               className="object-cover"
            //             />
            //           )}

            //           <AvatarFallback>
            //             {recommendation.sender_profile.username[0].toUpperCase()}
            //           </AvatarFallback>
            //         </Avatar>

            //         <p>{recommendation.sender_profile.username}</p>

            //         <Separator orientation="vertical" className="h-4" />

            //         <time className="text-xs text-muted-foreground">
            //           {time}
            //         </time>
            //       </div>

            //       <p className="w-full rounded-lg text-sm text-muted-foreground">
            //         Oiiiiiiiiii
            //       </p>
            //     </div>
            //   </div>
            // </div>
          )
        })}
      </div>
    </section>
  )
}
