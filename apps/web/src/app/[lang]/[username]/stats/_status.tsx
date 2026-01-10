'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@plotwist/ui/components/ui/chart'
import { Progress } from '@plotwist/ui/components/ui/progress'
import { Pie, PieChart } from 'recharts'
import type { GetUserIdItemsStatus200UserItemsItemStatus } from '@/api/endpoints.schemas'
import { useGetUserIdItemsStatusSuspense } from '@/api/user-stats'
import { useLanguage } from '@/context/language'
import { useLayoutContext } from '../_context'

const chartConfig = {
  items: {
    label: 'Items',
  },
  WATCHED: {
    label: 'WATCHED',
    color: 'hsl(var(--chart-5))',
  },
  WATCHING: {
    label: 'WATCHING',
    color: 'hsl(var(--chart-4))',
  },
  WATCHLIST: {
    label: 'WATCHLIST',
    color: 'hsl(var(--chart-3))',
  },
  DROPPED: {
    label: 'DROPPED',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

type StatusType = GetUserIdItemsStatus200UserItemsItemStatus

export function Status() {
  const { userId } = useLayoutContext()
  const { data } = useGetUserIdItemsStatusSuspense(userId)
  const { dictionary } = useLanguage()

  const chartData = data.userItems.map(item => {
    return {
      ...item,
      fill: chartConfig[item.status].color,
    }
  })

  const label: Record<StatusType, string> = {
    WATCHED: dictionary.watched,
    WATCHING: dictionary.watching,
    WATCHLIST: dictionary.watchlist,
    DROPPED: dictionary.dropped,
  }

  return (
    <Card className="sm:col-span-1 col-span-2">
      <CardHeader className="flex flex-row justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">
            {dictionary.title_status}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {dictionary.title_status_description}
          </p>
        </div>
        <PieChart className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent className="mt-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[220px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, status) =>
                    `${label[status as StatusType]}: ${value}`
                  }
                />
              }
            />
            <Pie data={chartData} dataKey="count" nameKey="status" label />
          </PieChart>
        </ChartContainer>

        <div className="mt-4 space-y-4">
          {data.userItems.map(({ status, count, percentage }) => (
            <div className="space-y-2" key={status}>
              <div className="flex justify-between items-center text-sm">
                <span>{label[status]}</span>

                <span className="text-muted-foreground text-xs">
                  {percentage.toFixed(2)}% ({count})
                </span>
              </div>
              <Progress value={percentage} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function StatusSkeleton() {
  const data = [
    {
      status: 'WATCHED',
      count: 1,
      percentage: 33.33,
      fill: 'hsl(var(--chart-5))',
    },
    {
      status: 'WATCHING',
      count: 1,
      percentage: 33.33,
      fill: 'hsl(var(--chart-4))',
    },
    {
      status: 'WATCHLIST',
      count: 1,
      percentage: 33.33,
      fill: 'hsl(var(--chart-3))',
    },
    {
      status: 'DROPPED',
      count: 1,
      percentage: 33.33,
      fill: 'hsl(var(--chart-2))',
    },
  ] as const

  const { dictionary } = useLanguage()

  const chartData = data.map(item => {
    return {
      ...item,
      fill: chartConfig[item.status].color,
    }
  })

  const label: Record<StatusType, string> = {
    WATCHED: dictionary.watched,
    WATCHING: dictionary.watching,
    WATCHLIST: dictionary.watchlist,
    DROPPED: dictionary.dropped,
  }

  return (
    <Card className="sm:col-span-1 col-span-2">
      <CardHeader className="flex flex-row justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">
            {dictionary.title_status}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {dictionary.title_status_description}
          </p>
        </div>
        <PieChart className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent className="mt-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[220px]"
        >
          <PieChart>
            <Pie data={chartData} dataKey="count" nameKey="status" label />
          </PieChart>
        </ChartContainer>

        <div className="mt-4 space-y-4">
          {data.map(({ status, count, percentage }) => (
            <div className="space-y-2" key={status}>
              <div className="flex justify-between items-center text-sm">
                <span>{label[status]}</span>

                <span className="text-muted-foreground text-xs">
                  {percentage.toFixed(2)}% ({count})
                </span>
              </div>
              <Progress value={percentage} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
