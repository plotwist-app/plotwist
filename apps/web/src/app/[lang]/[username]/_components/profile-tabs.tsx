'use client'

import {
  Activity,
  Award,
  BarChartHorizontalBig,
  List,
  Star,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@plotwist/ui/components/ui/tabs'
import { useLanguage } from '@/context/language'
import { GetUsersUsername200User } from '@/api/endpoints.schemas'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import Link from 'next/link'

type ProfileTabsProps = {
  user: GetUsersUsername200User
}

export const ProfileTabs = ({ user }: ProfileTabsProps) => {
  const { dictionary, language } = useLanguage()
  const pathname = usePathname()

  const value = useMemo(() => {
    if (pathname.split('/').length === 3) {
      return 'activity'
    }

    return pathname.split('/')[3]
  }, [pathname])

  return (
    <Tabs defaultValue="activity" value={value} className="w-full">
      <div className="md:m-none p-none -mx-4 max-w-[100vw] overflow-x-scroll px-4 scrollbar-hide">
        <TabsList>
          <TabsTrigger value="activity" asChild>
            <Link href={`/${language}/${user.username}`}>
              <Activity className="mr-1" width={12} height={12} />
              Activity
            </Link>
          </TabsTrigger>

          <TabsTrigger value="watched" asChild>
            <Link href={`/${language}/${user.username}/watched`}>
              <List className="mr-1" width={12} height={12} />
              Watched
            </Link>
          </TabsTrigger>

          <TabsTrigger value="watchlist" asChild>
            <Link href={`/${language}/${user.username}/watchlist`}>
              <List className="mr-1" width={12} height={12} />
              Watchlist
            </Link>
          </TabsTrigger>

          <TabsTrigger value="lists" asChild>
            <Link href={`/${language}/${user.username}/lists`}>
              <List className="mr-1" width={12} height={12} />
              {dictionary.profile.lists}
            </Link>
          </TabsTrigger>

          <TabsTrigger value="reviews" asChild>
            <Link href={`/${language}/${user.username}/reviews`}>
              <Star className="mr-1" width={12} height={12} />
              {dictionary.profile.reviews}
            </Link>
          </TabsTrigger>

          <TabsTrigger value="achievements" disabled>
            <Award className="mr-1" width={12} height={12} />

            {dictionary.profile.achievements}
          </TabsTrigger>

          <TabsTrigger value="achievements" disabled>
            <BarChartHorizontalBig className="mr-1" width={12} height={12} />
            Stats
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  )
}
