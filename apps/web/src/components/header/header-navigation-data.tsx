import {
  Calendar,
  Clapperboard,
  Heart,
  Home,
  JapaneseYen,
  List,
  Play,
  Sparkles,
  Star,
  Tv,
  type LucideIcon,
} from 'lucide-react'

import type { Dictionary } from '@/utils/dictionaries'

type NavigationItem = {
  label: string
  href: string
  icon: LucideIcon
  description?: string
  items?: NavigationItem[]
}

type buildLanguageNavigation = (dictionary: Dictionary) => NavigationItem[]

export const buildLanguageNavigation: buildLanguageNavigation = dictionary => [
  {
    label: dictionary.navigation.home,
    href: '/home',
    icon: Home,
  },
  {
    label: dictionary.movies,
    href: '/movies',
    icon: Clapperboard,
    items: [
      {
        label: dictionary.navigation.discover,
        description: dictionary.movie_pages.discover.description,
        href: '/movies/discover',
        icon: Sparkles,
      },
      {
        label: dictionary.navigation.now_playing,
        description: dictionary.movie_pages.now_playing.description,
        href: '/movies/now-playing',
        icon: Play,
      },
      {
        label: dictionary.navigation.popular,
        description: dictionary.movie_pages.popular.description,
        href: '/movies/popular',
        icon: Heart,
      },
      {
        label: dictionary.navigation.top_rated,
        description: dictionary.movie_pages.top_rated.description,
        href: '/movies/top-rated',
        icon: Star,
      },
      {
        label: dictionary.navigation.upcoming,
        description: dictionary.movie_pages.upcoming.description,
        href: '/movies/upcoming',
        icon: Calendar,
      },
    ],
  },
  {
    label: dictionary.tv_series,
    href: '/tv-series',
    icon: Tv,
    items: [
      {
        label: dictionary.navigation.discover,
        description: dictionary.tv_serie_pages.discover.description,
        href: '/tv-series/discover',
        icon: Sparkles,
      },
      {
        label: dictionary.navigation.airing_today,
        description: dictionary.tv_serie_pages.airing_today.description,
        href: '/tv-series/airing-today',
        icon: Play,
      },
      {
        label: dictionary.navigation.on_the_air,
        description: dictionary.tv_serie_pages.on_the_air.description,
        href: '/tv-series/on-the-air',
        icon: Tv,
      },
      {
        label: dictionary.navigation.popular,
        description: dictionary.tv_serie_pages.popular.description,
        href: '/tv-series/popular',
        icon: Heart,
      },
      {
        label: dictionary.navigation.top_rated,
        description: dictionary.tv_serie_pages.top_rated.description,
        href: '/tv-series/top-rated',
        icon: Star,
      },
    ],
  },

  {
    label: dictionary.animes_page.title,
    href: '/animes',
    icon: JapaneseYen,
  },
  {
    label: dictionary.doramas,
    href: '/doramas',
    icon: Heart,
  },
  {
    label: dictionary.navigation.lists,
    href: '/lists',
    icon: List,
  },
]
