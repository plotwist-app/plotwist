'use client'

import {
  Calendar,
  Clapperboard,
  Heart,
  Home,
  Play,
  Sparkles,
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
import { SidebarSearchProvider } from './sidebar-search-provider'

export const NAVIGATION: SidebarNavigationItemProps[] = [
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
        label: 'Discover',
        href: '/app/movies/discover',
        icon: Sparkles,
      },
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
        href: '/app/tv-shows/airing-today',
        icon: Play,
      },
      {
        label: 'On the air',
        href: '/app/tv-shows/on-the-air',
        icon: Tv,
      },
      {
        label: 'Popular',
        href: '/app/tv-shows/popular',
        icon: Heart,
      },
      {
        label: 'Top Rated',
        href: '/app/tv-shows/top-rated',
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
      <SidebarSearchProvider>
        <SidebarSearch />
      </SidebarSearchProvider>

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
