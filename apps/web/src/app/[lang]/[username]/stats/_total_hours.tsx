'use client'

import { useGetUserIdTotalHoursSuspense } from '@/api/user-stats'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'
import { Hourglass } from 'lucide-react'
import { useLayoutContext } from '../_context'
import NumberFlow from '@number-flow/react'

export function TotalHours() {
  const { userId } = useLayoutContext()
  const { data } = useGetUserIdTotalHoursSuspense(userId)

  const totalHours = Number.parseFloat(data.totalHours.toFixed(1))
  const days = Math.floor(totalHours / 24)
  const hours = (totalHours % 24).toFixed(1)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Horas Totais Assistidas
        </CardTitle>

        <Hourglass className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          <NumberFlow value={totalHours} />h
        </div>
        <p className="text-xs text-muted-foreground">
          {days} dias e {hours} horas
        </p>
      </CardContent>
    </Card>
  )
}
