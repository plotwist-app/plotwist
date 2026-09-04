import { Instrument_Sans } from 'next/font/google'
import type { ReactNode } from 'react'
import { TogetherThemeRoot } from './_components/together-theme-root'
import './together.css'

const sans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-together',
})

export default function TogetherLayout({ children }: { children: ReactNode }) {
  return (
    <div className={sans.variable}>
      <TogetherThemeRoot>{children}</TogetherThemeRoot>
    </div>
  )
}
