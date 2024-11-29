'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@plotwist/ui/components/ui/chart'
import { Progress } from '@plotwist/ui/components/ui/progress'
import { Pie, PieChart } from 'recharts'

const chartData = [
  { status: 'watched', count: 60, fill: 'var(--color-watched)' },
  { status: 'watching', count: 5, fill: 'var(--color-watching)' },
  { status: 'watchlist', count: 35, fill: 'var(--color-watchlist)' },
]

const chartConfig = {
  items: {
    label: 'Items',
  },
  watched: {
    label: 'watched',
    color: 'hsl(var(--chart-4))',
  },
  watching: {
    label: 'watching',
    color: 'hsl(var(--chart-3))',
  },
  watchlist: {
    label: 'watchlist',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

export function Status() {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">
            Status dos Títulos
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Assistidos, assistindo e assistir
          </p>
        </div>
        <PieChart className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent className="mt-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={chartData} dataKey="count" nameKey="status" label />
          </PieChart>
        </ChartContainer>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Assistidos</span>

              <span className="text-muted-foreground text-xs">
                60% (60 títulos)
              </span>
            </div>
            <Progress value={60} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Assistidos</span>

              <span className="text-muted-foreground text-xs">
                5% (5 títulos)
              </span>
            </div>
            <Progress value={5} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Assistir</span>

              <span className="text-muted-foreground text-xs">
                35% (35 títulos)
              </span>
            </div>
            <Progress value={35} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
