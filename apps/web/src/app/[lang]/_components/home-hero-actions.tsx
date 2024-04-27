'use client'

import Link from 'next/link'

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

export const HomeHeroActions = () => {
  const { user } = useAuth()
  const { language, dictionary } = useLanguage()

  if (!user)
    return (
      <div className="flex gap-2">
        <Button asChild>
          <Link href={`/${language}/login`}>{dictionary.access_now}</Link>
        </Button>

        <Button asChild variant="outline">
          <Link href={`/${language}/sign-up`}>{dictionary.create_account}</Link>
        </Button>
      </div>
    )

  const username: string = user.username
  const initial = username[0]?.toUpperCase()

  return (
    <Button asChild variant="outline" className="bg-background">
      <Link href={`/${language}/home`}>
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
        {dictionary.access_now}
      </Link>
    </Button>
  )
}
