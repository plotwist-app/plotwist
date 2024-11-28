'use client'

import type { GetUsersUsername200User } from '@/api/endpoints.schemas'
import { ProBadge } from '@/components/pro-badge'
import { useLanguage } from '@/context/language'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { Button } from '@plotwist/ui/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@plotwist/ui/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@plotwist/ui/components/ui/tabs'
import {
  Activity,
  Check,
  Clock,
  List,
  Loader,
  MoreVertical,
  Star,
  Trophy,
  BarChart,
  Share,
  Forward,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

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

  const HIDDEN_TABS = [
    {
      label: dictionary.profile.reviews,
      path: 'reviews',
      icon: <Star className="mr-1" size={12} />,
      disabled: false,
    },
    {
      label: dictionary.profile.recommendations,
      path: 'recommendations',
      icon: <Forward className="mr-1" size={12} />,
      disabled: true,
    },
    {
      label: dictionary.profile.achievements,
      path: 'achievements',
      icon: <Trophy className="mr-1" size={12} />,
      disabled: true,
      pro: true,
    },
    {
      label: dictionary.stats,
      path: 'stats',
      icon: <BarChart className="mr-1" size={12} />,
      disabled: false,
      pro: true,
    },
  ]

  return (
    <Tabs defaultValue="activity" value={value} className="w-full">
      <div className="md:m-none p-none -mx-4 max-w-[100vw] overflow-x-scroll px-4 scrollbar-hide">
        <TabsList>
          <TabsTrigger value="activity" asChild>
            <Link href={`/${language}/${user.username}`}>
              <Activity className="mr-1" size={12} />
              {dictionary.activity}
            </Link>
          </TabsTrigger>

          <TabsTrigger value="watched" asChild>
            <Link href={`/${language}/${user.username}/watched`}>
              <Check className="mr-1" size={12} />
              {dictionary.watched}
            </Link>
          </TabsTrigger>

          <TabsTrigger value="watching" asChild>
            <Link href={`/${language}/${user.username}/watching`}>
              <Loader className="mr-1" size={12} />
              {dictionary.watching}
            </Link>
          </TabsTrigger>

          <TabsTrigger value="watchlist" asChild>
            <Link href={`/${language}/${user.username}/watchlist`}>
              <Clock className="mr-1" size={12} />
              {dictionary.watchlist}
            </Link>
          </TabsTrigger>

          <TabsTrigger value="lists" asChild>
            <Link href={`/${language}/${user.username}/lists`}>
              <List className="mr-1" size={12} />
              {dictionary.profile.lists}
            </Link>
          </TabsTrigger>

          {HIDDEN_TABS.map(tab => (
            <TabsTrigger
              value={tab.label}
              key={tab.label}
              disabled={tab.disabled}
              asChild
            >
              <Link
                href={`/${language}/${user.username}/${tab.path}`}
                className={cn(
                  'w-full flex lg:hidden',
                  tab.disabled && 'opacity-50 pointer-events-none'
                )}
              >
                {tab.icon}
                {tab.label}
                {tab.pro && <ProBadge className="ml-2" />}
              </Link>
            </TabsTrigger>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="hidden items-center text-sm justify-center whitespace-nowrap rounded-md px-3 py-1 font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:flex">
                <MoreVertical size={12} />
                {dictionary.more}
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[200px]">
              {HIDDEN_TABS.map(tab => (
                <DropdownMenuItem
                  asChild
                  className={cn(value.includes(tab.path) && 'bg-muted')}
                  key={tab.label}
                  disabled={tab.disabled}
                >
                  <Link
                    href={`/${language}/${user.username}/${tab.path}`}
                    className="w-full"
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.pro && <ProBadge className="ml-auto" isLink={false} />}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TabsList>
      </div>
    </Tabs>
  )
}
