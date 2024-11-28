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
} from '@plotwist/ui/components/ui/chart'
import { Hourglass } from 'lucide-react'
import { Line, LineChart } from 'recharts'

// Dados atualizados para representar as horas gastas assistindo filmes
const data = [
  { hours: 40, month: 'Jan' },
  { hours: 45, month: 'Feb' },
  { hours: 38, month: 'Mar' },
  { hours: 30, month: 'Apr' },
  { hours: 20, month: 'May' },
  { hours: 25, month: 'Jun' },
  { hours: 35, month: 'Jul' },
  { hours: 45, month: 'Aug' },
]

const chartConfig = {
  hours: {
    label: 'Hours Watched',
    theme: {
      light: 'black',
      dark: 'white',
    },
  },
} satisfies ChartConfig

export function TotalHours() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Horas Totais Assistidas
        </CardTitle>
        <Hourglass className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">248h</div>
        <p className="text-xs text-muted-foreground">
          Equivalentes a 10 dias e meio
        </p>

        {/* <ChartContainer config={chartConfig} className="h-[80px] w-full mt-4">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <Line
              type="monotone"
              strokeWidth={2}
              dataKey="hours"
              activeDot={{
                r: 6,
                fill: 'var(--color-hours)',
              }}
              stroke="var(--color-hours)"
            />
          </LineChart>
        </ChartContainer> */}
      </CardContent>
    </Card>
  )
}
