import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/currency/format'
import { DollarSign } from 'lucide-react'

type BalanceProps = {
  revenue: number
  budget: number
}

export const Balance = ({ budget, revenue }: BalanceProps) => {
  const profit = revenue - budget
  const positiveProfit = profit > 0

  return (
    <div className="flex w-full flex-col rounded-md border">
      <div className="relative flex flex-col border-b p-2">
        <span className="text-sm text-muted-foreground">Budget</span>
        <DollarSign width={16} className="absolute right-2 top-2 text-muted" />
        <span className="text-sm font-bold">{formatCurrency(budget)}</span>
      </div>

      <div className="relative flex flex-col p-2">
        <span className="text-md text-sm text-muted-foreground">Revenue</span>
        <DollarSign width={16} className="absolute right-2 top-2 text-muted" />

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{formatCurrency(revenue)}</span>

          <span
            className={cn(
              'text-xs text-muted-foreground',
              positiveProfit ? 'text-green-300' : 'text-red-300',
            )}
          >
            {positiveProfit ? '+' : ''}
            {formatCurrency(profit)}
          </span>
        </div>
      </div>
    </div>
  )
}
