import { eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns'
import { cn } from '../../lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'

type ContributionLevel = 0 | 1 | 2 | 3 | 4

interface ContributionDay {
  date: string // ISO date string (YYYY-MM-DD)
  count: number
}

interface HeatmapProps {
  data: ContributionDay[]
  locale?: string
  year?: number
}

function getDaysOfYear(year: number) {
  return eachDayOfInterval({
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31),
  })
}

export function Heatmap({ data = [], locale, year = 2025 }: HeatmapProps) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(year, i, 1)
    return {
      name: date.toLocaleString(locale, { month: 'short' }),
      daysCount: endOfMonth(date).getDate(),
    }
  })

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  const totalDays = getDaysOfYear(year).length
  const days = getDaysOfYear(year)

  return (
    <div className="flex flex-col gap-2 overflow-x-auto pb-2">
      {/* Months */}
      <div className="flex gap-4">
        <div className="w-[1ch]" />

        <div className="flex w-full">
          {months.map(month => {
            const monthPercentage = (month.daysCount / totalDays) * 100

            return (
              <div
                key={month.name}
                className="text-xs"
                style={{ width: `${monthPercentage}%` }}
              >
                {month.name}
              </div>
            )
          })}
        </div>
      </div>

      {/* Days */}
      <div className="w-full flex gap-4">
        <div className="flex flex-col">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center text-xs">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[repeat(54,1fr)] gap-0.5 grid-rows-[repeat(7,1fr)] [grid-auto-flow:column]">
          {days.map(day => (
            <TooltipProvider key={day.getTime()}>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex-1 text-center text-xs rounded-[4px] bg-muted border hover:bg-muted-foreground size-2.5" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{format(day, 'dd/MM/yyyy')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </div>
  )
}
