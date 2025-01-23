'use client'

import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { cn } from '@/lib/utils'
import { Link } from 'next-view-transitions'
import type { ComponentProps } from 'react'

export const SeeAllLists = ({ className }: ComponentProps<'div'>) => {
  const { user } = useSession()
  const { dictionary, language } = useLanguage()

  return (
    <>
      {user && (
        <Link
          href={`/${language}/${user.username}/lists`}
          className={cn(
            'hidden text-sm text-muted-foreground hover:underline md:block',
            className
          )}
        >
          {dictionary.see_all_list}
        </Link>
      )}
    </>
  )
}
