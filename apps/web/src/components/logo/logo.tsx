'use client'

import { useLanguage } from '@/context/language'
import Image from 'next/image'
import Link from 'next/link'

export const Logo = () => {
  const { language } = useLanguage()

  return (
    <Link href={`/${language}/`} className="text-foreground">
      <Image
        src="/logo-black.svg"
        alt="Logo"
        width={24}
        height={24}
        className="dark:hidden"
      />

      <Image
        src="/logo-white.svg"
        alt="Logo"
        width={24}
        height={24}
        className="hidden dark:block"
      />
    </Link>
  )
}
