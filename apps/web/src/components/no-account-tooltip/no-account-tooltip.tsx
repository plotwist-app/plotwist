'use client'

import { PropsWithChildren } from 'react'
import Link from 'next/link'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui'

import { useLanguage } from '@/context/language'
import { TooltipPortal } from '@radix-ui/react-tooltip'

export const NoAccountTooltip = ({ children }: PropsWithChildren) => {
  const { dictionary, language } = useLanguage()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>

        <TooltipPortal>
          <TooltipContent>
            <Link href={`/${language}/login`}>
              {dictionary.no_account_tooltip}
            </Link>
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  )
}
