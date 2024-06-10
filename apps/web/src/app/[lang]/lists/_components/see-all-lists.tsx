'use client'

import { useAuth } from '@/context/auth'
import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ComponentProps } from 'react'

export const SeeAllLists = ({ className }: ComponentProps<'div'>) => {
  const { user } = useAuth()
  const { dictionary, language } = useLanguage()

  return (
    <>
      {user && (
        <Link
          href={`/${language}/${user.username}?tab=lists`}
          className={cn(
            'hidden text-sm text-muted-foreground hover:underline md:block',
            className,
          )}
        >
          {dictionary.see_all_list}
        </Link>
      )}
    </>
  )
}
