'use client'

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon,
} from '@radix-ui/react-icons'
import { Column } from '@tanstack/react-table'
import { ElementType } from 'react'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@plotwist/ui'

import { cn } from '@/lib/utils'

import { useLanguage } from '@/context/language'

interface TableColumnHeaderProps<T, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<T, TValue>
  title: string
}

export function TableColumnHeader<T, TValue>({
  column,
  title,
  className,
}: TableColumnHeaderProps<T, TValue>) {
  const { dictionary } = useLanguage()

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  const sorted = column.getIsSorted()

  const iconBySortedDirection: Record<'desc' | 'asc', ElementType> = {
    asc: ArrowUpIcon,
    desc: ArrowDownIcon,
  }

  const Icon = sorted ? iconBySortedDirection[sorted] : CaretSortIcon

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            <Icon className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            {dictionary.data_table_column_header.asc}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            {dictionary.data_table_column_header.desc}
          </DropdownMenuItem>

          {column.getCanHide() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <EyeNoneIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                {dictionary.data_table_column_header.hide}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
