'use client'

import { useAuth } from '@/context/auth'
import { Language } from '@/types/languages'
import {
  Avatar,
  AvatarFallback,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui'

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

  const username: string = user.user_metadata.username
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
