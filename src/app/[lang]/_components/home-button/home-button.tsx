'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuth } from '@/context/auth'
import { useLanguage } from '@/context/language'
import { getUserService } from '@/services/api/users/get-user'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

export const HomeButton = () => {
  const {
    dictionary: {
      home: { primary_button: primaryButton },
    },
    language,
  } = useLanguage()
  const { user } = useAuth()

  if (!user)
    return (
      <Button asChild variant="outline">
        <Link href={`/${language}/login`}>{primaryButton}</Link>
      </Button>
    )

  const username: string = user.user_metadata.username
  const initial = username[0].toUpperCase()

  return (
    <Button variant="outline" asChild>
      <Link href={`/${language}/app`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="mr-2 h-6 w-6 border text-[10px]">
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>

            <TooltipContent>{username}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {primaryButton}
      </Link>
    </Button>
  )
}
