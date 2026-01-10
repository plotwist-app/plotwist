'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@plotwist/ui/components/ui/chart'
import { Label, Pie, PieChart } from 'recharts'
import { useLanguage } from '@/context/language'

const chartData = [
  { genre: 'Action', series: 27, fill: 'var(--color-action)' },
  { genre: 'Comedy', series: 20, fill: 'var(--color-comedy)' },
  { genre: 'Drama', series: 12, fill: 'var(--color-drama)' },
  { genre: 'Horror', series: 13, fill: 'var(--color-horror)' },
  { genre: 'Sci-Fi', series: 15, fill: 'var(--color-sci-fi)' },
]

const total = chartData.reduce((sum, item) => sum + item.series, 0)

const chartConfig = {
  action: {
    label: 'Action',
    color: 'hsl(var(--chart-1))',
  },
  comedy: {
    label: 'Comedy',
    color: 'hsl(var(--chart-2))',
  },
  drama: {
    label: 'Drama',
    color: 'hsl(var(--chart-3))',
  },
  horror: {
    label: 'Horror',
    color: 'hsl(var(--chart-4))',
  },
  'sci-fi': {
    label: 'Sci-Fi',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig

export function WatchedSeriesStats() {
  const { dictionary } = useLanguage()

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Total Watched Series/Anime</CardTitle>
        <CardDescription>
          Explore the distribution of genres among your watched series.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="series"
              nameKey="genre"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {dictionary.tv_series}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
