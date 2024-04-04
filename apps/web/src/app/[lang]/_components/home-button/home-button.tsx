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
import { Language } from '@/types/languages'

import Link from 'next/link'

type HomeButtonProps = {
  primaryButton: string
  language: Language
}

export const HomeButton = ({ primaryButton, language }: HomeButtonProps) => {
  const { user } = useAuth()

  if (!user)
    return (
      <Button asChild variant="outline">
        <Link href={`/${language}/login`} prefetch={false}>
          {primaryButton}
        </Link>
      </Button>
    )

  const username: string = user.username
  const initial = username[0]?.toUpperCase()

  return (
    <Button variant="outline" asChild>
      <Link href={`/${language}/home`} prefetch={false}>
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
