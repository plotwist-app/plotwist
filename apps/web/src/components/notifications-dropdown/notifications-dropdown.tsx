'use client'

import { BellIcon } from 'lucide-react'

import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '../ui/dropdown-menu'
import { useLanguage } from '@/context/language'

export const NotificationsDropdown = () => {
  const { dictionary } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <BellIcon width={16} height={16} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {dictionary.notifications_dropdown.notifications}
          </DropdownMenuLabel>
          <div className="mt-2 grid justify-items-center gap-3 px-2 py-1.5">
            <BellIcon
              className="text-muted-foreground"
              width={40}
              height={40}
            />
            <p className="line-clamp-3 text-center text-xs text-muted-foreground">
              {dictionary.notifications_dropdown.no_notifications}
            </p>
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
