import { useLanguage } from '@/context/language'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui/components/ui/tooltip'
import Link from 'next/link'
import { PropsWithChildren } from 'react'

export function ProFeatureTooltip({ children }: PropsWithChildren) {
  const { language, dictionary } = useLanguage()

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild className="opacity-75">
          <Link href={`/${language}#pricing`}>{children}</Link>
        </TooltipTrigger>

        <TooltipContent>
          <p>{dictionary.feature_only_in_pro_plan}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
