'use client'

import { Badge } from '@plotwist/ui'
import { cva } from 'class-variance-authority'

import { useLanguage } from '@/context/language'
import { ListItemStatus } from '@/types/supabase/lists'

type StatusBadgeProps = { status: ListItemStatus }

const badge = cva(
  'flex justify-center items-center gap-1 py-1 text-[12px] capitalize shadow border-none font-normal w-20 whitespace-nowrap',
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
  const { dictionary } = useLanguage()

  const lowerStatus = status.toLowerCase() as 'pending' | 'watching' | 'watched'

  return (
    <Badge variant="outline" className={badge({ status })}>
      {dictionary.statuses[lowerStatus]}
    </Badge>
  )
}
