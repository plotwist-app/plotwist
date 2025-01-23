'use client'

import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import Image from 'next/image'
import { Link } from 'next-view-transitions'

type LogoProps = { size?: number }
export const Logo = ({ size = 24 }: LogoProps) => {
  const { language } = useLanguage()

  const { user } = useSession()

  return (
    <Link
      href={user ? `/${language}/home` : `/${language}/`}
      className="text-foreground"
    >
      <Image
        src="/logo-black.svg"
        alt="Logo"
        width={size}
        height={size}
        className="dark:hidden"
      />

      <Image
        src="/logo-white.svg"
        alt="Logo"
        width={size}
        height={size}
        className="hidden dark:block"
      />
    </Link>
  )
}
