'use client'

import { useLanguage } from '@/context/language'
import { Tabs, TabsList, TabsTrigger } from '@plotwist/ui/components/ui/tabs'
import { Link } from 'next-view-transitions'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

type PersonTabsProps = {
  personId: string
}

export function PersonTabs({ personId }: PersonTabsProps) {
  const pathname = usePathname()
  const { language, dictionary } = useLanguage()

  const splittedPathname = pathname.split('/')
  const minSegments = 4

  const value = useMemo(() => {
    if (splittedPathname.length === minSegments) {
      return 'credits'
    }

    return splittedPathname[splittedPathname.length - 1]
  }, [splittedPathname])

  return (
    <Tabs value={value}>
      <TabsList>
        <TabsTrigger value="credits" asChild>
          <Link href={`/${language}/people/${personId}`}>
            {dictionary.tabs.credits}
          </Link>
        </TabsTrigger>

        <TabsTrigger value="biography" asChild>
          <Link href={`/${language}/people/${personId}/biography`}>
            {dictionary.biography}
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
