import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
} from 'date-fns'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'
import { cn } from '@plotwist/ui/lib/utils'

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

export function Heatmap({ data = [], locale, year = 2024 }: HeatmapProps) {
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
      {/* Days */}
      <div className="w-full flex gap-4">
        <div className="flex flex-col mt-4">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center text-xs">
              {day}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-4">
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

          <div className="grid grid-cols-[repeat(54,1fr)] gap-1 grid-rows-[repeat(7,1fr)] [grid-auto-flow:column]">
            {days.map(day => {
              const contributionDay = data.find(d =>
                isSameDay(parseISO(d.date), day)
              )

              const getBackgroundColor = () => {
                if (!contributionDay || contributionDay.count === 0)
                  return 'bg-muted'

                if (contributionDay.count > 1) return 'bg-primary'

                return 'bg-muted'
              }

              return (
                <TooltipProvider key={day.getTime()}>
                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        className={cn(
                          'flex-1 text-center text-xs rounded-[2px] size-[8.5px]',
                          getBackgroundColor()
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{format(day, 'dd/MM/yyyy')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
