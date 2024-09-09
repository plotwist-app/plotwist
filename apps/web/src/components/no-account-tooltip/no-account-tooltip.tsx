'use client'

import { PropsWithChildren } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui/components/ui/tooltip'

import { useLanguage } from '@/context/language'
import { TooltipPortal } from '@radix-ui/react-tooltip'
import Link from 'next/link'

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
