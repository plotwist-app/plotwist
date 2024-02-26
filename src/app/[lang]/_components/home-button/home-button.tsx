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
import Link from 'next/link'

export const HomeButton = async () => {
  const { user } = useAuth()
  const {
    language,
    dictionary: {
      home: { primary_button: primaryButton },
    },
  } = useLanguage()

  const username: string = user?.user_metadata.username
  const initial = username ? username[0].toUpperCase() : undefined

  return (
    <Button variant="outline" asChild>
      {user ? (
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
      ) : (
        <Link href={`/${language}/login`}>{primaryButton}</Link>
      )}
    </Button>
  )
}
