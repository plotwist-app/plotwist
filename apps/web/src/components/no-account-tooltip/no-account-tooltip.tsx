'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui/components/ui/tooltip'
import { TooltipPortal } from '@radix-ui/react-tooltip'
import { Link } from 'next-view-transitions'
import type { PropsWithChildren } from 'react'
import { useLanguage } from '@/context/language'

export const NoAccountTooltip = ({ children }: PropsWithChildren) => {
  const { dictionary, language } = useLanguage()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>

        <TooltipPortal>
          <TooltipContent>
            <Link href={`/${language}/sign-in`}>
              {dictionary.no_account_tooltip}
            </Link>
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  )
}
