'use client'

import { useTheme } from 'next-themes'
import { Button } from './ui/button'

export const ThemeToggle = () => {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="outline"
      onClick={() => (theme === 'dark' ? setTheme('light') : setTheme('dark'))}
    >
      Theme
    </Button>
  )
}
