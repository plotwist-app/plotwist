'use client'

import {
  Calendar,
  Clapperboard,
  Heart,
  Home,
  Play,
  Star,
  Tv,
  User,
} from 'lucide-react'
import {
  SidebarNavigationItem,
  SidebarNavigationItemProps,
} from './sidebar-navigation-item'
import { Accordion } from '@/components/ui/accordion'
import { SidebarSearch } from './sidebar-search'

const NAVIGATION: SidebarNavigationItemProps[] = [
  {
    label: 'Dashboard',
    href: '/app',
    icon: Home,
  },
  {
    label: 'Movies',
    href: '/app/movies',
    icon: Clapperboard,
    items: [
      {
        label: 'Now playing',
        href: '/app/movies/now-playing',
        icon: Play,
      },
      {
        label: 'Popular',
        href: '/app/movies/popular',
        icon: Heart,
      },
      {
        label: 'Top rated',
        href: '/app/movies/top-rated',
        icon: Star,
      },
      {
        label: 'Upcoming',
        href: '/app/movies/upcoming',
        icon: Calendar,
      },
    ],
  },
  {
    label: 'TV Shows',
    href: '/app/tv-shows',
    icon: Tv,
    items: [
      {
        label: 'Airing Today',
        href: '/app/tv/airing-today',
        icon: Play,
      },
      {
        label: 'On the air',
        href: '/app/movies/popular',
        icon: Tv,
      },
      {
        label: 'Popular',
        href: '/app/movies/top-rated',
        icon: Heart,
      },
      {
        label: 'Top Rated',
        href: '/app/movies/upcoming',
        icon: Star,
      },
    ],
  },
  {
    label: 'People',
    href: '/app/people',
    icon: User,
    items: [
      {
        label: 'Popular',
        href: '/app/people/popular',
        icon: Heart,
      },
    ],
  },
]

export const SidebarNavigation = () => {
  return (
    <div className="space-y-4">
      <SidebarSearch />

      <Accordion type="multiple">
        <nav className="flex flex-col space-y-2">
          {NAVIGATION.map((item) => {
            return <SidebarNavigationItem {...item} key={item.href} />
          })}
        </nav>
      </Accordion>
    </div>
  )
}
