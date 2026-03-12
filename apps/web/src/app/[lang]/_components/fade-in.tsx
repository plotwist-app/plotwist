'use client'

import { BlurFade } from '@plotwist/ui/components/magicui/blur-fade'

type FadeInProps = {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <BlurFade inView delay={delay} className={className}>
      {children}
    </BlurFade>
  )
}
