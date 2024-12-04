'use client'

import { useGetUserIdTotalHoursSuspense } from '@/api/user-stats'
import { useLanguage } from '@/context/language'
import NumberFlow from '@number-flow/react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import { Hourglass } from 'lucide-react'
import { useLayoutContext } from '../_context'

export function TotalHours() {
  const { userId } = useLayoutContext()
  const { dictionary } = useLanguage()
  const { data } = useGetUserIdTotalHoursSuspense(userId)

  const totalHours = Number.parseFloat(data.totalHours.toFixed(1))
  const days = Math.floor(totalHours / 24)
  const hours = (totalHours % 24).toFixed(1)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
        <CardTitle className="text-sm font-medium">
          {dictionary.total_hours_watched}
        </CardTitle>

        <Hourglass className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          <NumberFlow value={totalHours} />h
        </div>
        <p className="text-xs text-muted-foreground">
          {days} {dictionary.days} {dictionary.and} {hours} {dictionary.hours}
        </p>
      </CardContent>
    </Card>
  )
}

export function TotalHoursSkeleton() {
  const { dictionary } = useLanguage()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {dictionary.total_hours_watched}
        </CardTitle>

        <Hourglass className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold items-center gap-2 flex">
          <Skeleton className=" w-[5ch] h-[2.5ex]" />
        </div>

        <Skeleton className="w-[10ch] h-[1.5ex] mt-4" />
      </CardContent>
    </Card>
  )
}
