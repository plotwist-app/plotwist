'use client'

import * as React from 'react'

import { DayPicker, DropdownProps, useNavigation } from 'react-day-picker'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from './select'
import { SelectItem } from '@radix-ui/react-select'
import { cn } from '../../lib/utils'
import { buttonVariants } from './button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  onSelect: any
}

type CustomDropdownItem = {
  key: string
  props: { value: number; children: string }
}

type CustomDropdownProps = DropdownProps &
  Pick<CalendarProps, 'selected' | 'onSelect'>

const CustomDropdown = (props: CustomDropdownProps) => {
  const { caption, name, children, selected, onSelect } = props
  const selectedDate = selected as Date
  const { goToDate, currentMonth } = useNavigation()

  const handleValueChange = (value: string) => {
    if (name === 'months') {
      const newDate = new Date(currentMonth)
      newDate.setMonth(Number(value))

      onSelect(newDate)

      return goToDate(newDate)
    }

    if (name === 'years') {
      const newDate = new Date(selectedDate)
      newDate.setFullYear(Number(value))

      onSelect(newDate)

      return goToDate(newDate)
    }
  }

  const defaultValue = React.useMemo(() => {
    if (selectedDate) {
      if (name === 'months') {
        const month = selectedDate.getMonth()
        return String(month)
      }

      if (name === 'years') {
        const year = selectedDate.getFullYear()
        return String(year)
      }
    }
  }, [name, selectedDate])

  const content = children as CustomDropdownItem[]

  return (
    <Select onValueChange={handleValueChange} defaultValue={defaultValue}>
      <SelectTrigger className="">
        <SelectValue placeholder={caption} />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup className="max-h-[300px] overflow-y-auto">
          {content.map((item) => {
            const { props } = item

            return (
              <SelectItem
                value={String(props.value)}
                key={JSON.stringify(item.props)}
              >
                {props.children}
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md',
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-8 w-8 p-0 font-normal aria-selected:opacity-100',
        ),
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside:
          'day-outside text-muted-foreground opacity-50  aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',

        day_hidden: 'invisible',

        caption_dropdowns: 'flex gap-2 w-full',
        dropdown_month: '[&>div]:hidden',
        dropdown_year: '[&>div]:hidden',
        vhidden: 'hidden',

        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeftIcon className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRightIcon className="h-4 w-4" />,

        Dropdown: ({ ...dropdownProps }) => (
          <CustomDropdown
            {...dropdownProps}
            selected={props.selected}
            onSelect={props.onSelect}
          />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
