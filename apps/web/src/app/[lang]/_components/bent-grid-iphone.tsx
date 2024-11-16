'use client'

import Iphone from '@plotwist/ui/components/ui/iphone-15-pro'
import { useTheme } from 'next-themes'

export function BentoGridIphone() {
  const { theme } = useTheme()

  return (
    <Iphone
      className="w-full h-auto"
      src={
        theme === 'light'
          ? '/images/lp/watched-light.png'
          : '/images/lp/watched.png'
      }
    />
  )
}
