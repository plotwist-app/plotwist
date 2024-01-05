import { Badge } from '@/components/ui/badge'
import { ListItemStatus } from '@/types/lists'
import { cva } from 'class-variance-authority'

type StatusBadgeProps = { status: ListItemStatus }

const badge = cva(
  'flex justify-center items-center gap-1 py-1 text-xs capitalize shadow border-none font-normal',
  {
    variants: {
      status: {
        PENDING:
          'bg-[#fadec9] text-[#6e3630] dark:bg-[#6e3630] dark:text-[#ffffffcd] ',

        WATCHING:
          'bg-[#fdecc8] text-[#402c1b] dark:bg-[#89632a] dark:text-[#ffffffcd]',

        WATCHED:
          'bg-[#dbeddb] text-#[#1c3829] dark:bg-[#1c3829] dark:text-[#dbeddb]',
      },
    },
  },
)

export const Status = ({ status }: StatusBadgeProps) => {
  return (
    <Badge variant="outline" className={badge({ status })}>
      {status.toLowerCase()}
    </Badge>
  )
}
