'use client'

import { useLanguage } from '@/context/language'
import { Tabs, TabsList, TabsTrigger } from '@plotwist/ui/components/ui/tabs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

type PersonTabsProps = {
  personId: string
}

export function PersonTabs({ personId }: PersonTabsProps) {
  const pathname = usePathname()
  const { language } = useLanguage()

  const spllitedPathname = pathname.split('/')
  const minSegments = 4

  const value = useMemo(() => {
    if (spllitedPathname.length === minSegments) {
      return 'biography'
    }

    return spllitedPathname[spllitedPathname.length - 1]
  }, [spllitedPathname])

  return (
    <Tabs value={value}>
      <TabsList>
        <TabsTrigger value="biography" asChild>
          <Link href={`/${language}/people/${personId}`}>Biografia</Link>
        </TabsTrigger>

        <TabsTrigger value="credits" asChild>
          <Link href={`/${language}/people/${personId}/credits`}>
            Filmes e séries
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
