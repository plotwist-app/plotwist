'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'
import { Progress } from '@plotwist/ui/components/ui/progress'
import { BarChartHorizontal, User } from 'lucide-react'
import Image from 'next/image'
import { v4 } from 'uuid'
import { useLayoutContext } from '../_context'
import { useGetUserIdWatchedCastSuspense } from '@/api/user-stats'
import { useLanguage } from '@/context/language'
import { tmdbImage } from '@/utils/tmdb/image'

export function TopActors() {
  const { userId } = useLayoutContext()
  const { language } = useLanguage()

  const { data } = useGetUserIdWatchedCastSuspense(userId, { language })

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">Top 5 Atores</CardTitle>
          <p className="text-xs text-muted-foreground">
            Atores que mais aparecem no seu histórico
          </p>
        </div>
        <User className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent className="">
        <div className="space-y-4 mt-2">
          {data.watchedCast.map(actor => (
            <div className="flex gap-2" key={actor.id}>
              <div className="relative flex aspect-square items-center justify-center overflow-hidden size-8 rounded-full border">
                {actor.profilePath ? (
                  <Image
                    loading="lazy"
                    src={tmdbImage(actor.profilePath)}
                    fill
                    className="object-cover"
                    sizes="100%"
                    alt="aaa"
                  />
                ) : (
                  <span>{actor.name[0]}</span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-xs">
                  <p>{actor.name}</p>
                  <p className="text-muted-foreground">{actor.count} títulos</p>
                </div>

                <Progress value={actor.percentage} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
