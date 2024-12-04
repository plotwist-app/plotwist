'use client'

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@plotwist/ui/components/ui/chart'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'

import { Label, Pie, PieChart } from 'recharts'

const chartData = [
  { genre: 'Action', movies: 70, fill: 'var(--color-action)' },
  { genre: 'Comedy', movies: 51, fill: 'var(--color-comedy)' },
  { genre: 'Drama', movies: 19, fill: 'var(--color-drama)' },
  { genre: 'Horror', movies: 32, fill: 'var(--color-horror)' },
  { genre: 'Sci-Fi', movies: 19, fill: 'var(--color-sci-fi)' },
]

const total = chartData.reduce((sum, item) => sum + item.movies, 0)

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

export function WatchedMoviesStats() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Total Watched Movies</CardTitle>
        <CardDescription>
          Explore the distribution of genres among your watched movies.
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
              dataKey="movies"
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
                          Movies
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
