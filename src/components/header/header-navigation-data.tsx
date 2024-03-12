import {
  Calendar,
  Clapperboard,
  Heart,
  Home,
  List,
  LucideIcon,
  Play,
  Sparkles,
  Star,
  Tv,
  User,
} from 'lucide-react'

import { Dictionary } from '@/utils/dictionaries'

type NavigationItem = {
  label: string
  href: string
  icon: LucideIcon
  description?: string
  items?: NavigationItem[]
}

type buildLanguageNavigation = (dictionary: Dictionary) => NavigationItem[]

export const buildLanguageNavigation: buildLanguageNavigation = (
  dictionary,
) => [
  {
    label: dictionary.navigation.home,
    href: '/home',
    icon: Home,
  },
  {
    label: dictionary.navigation.movies,
    href: '/movies',
    icon: Clapperboard,
    items: [
      {
        label: dictionary.navigation.discover,
        description: dictionary.navigation.discover_description,
        href: '/movies/discover',
        icon: Sparkles,
      },
      {
        label: dictionary.navigation.now_playing,
        description: dictionary.navigation.now_playing_description,
        href: '/movies/now-playing',
        icon: Play,
      },
      {
        label: dictionary.navigation.popular,
        description: dictionary.navigation.popular_description,
        href: '/movies/popular',
        icon: Heart,
      },
      {
        label: dictionary.navigation.top_rated,
        description: dictionary.navigation.top_rated_description,
        href: '/movies/top-rated',
        icon: Star,
      },
      {
        label: dictionary.navigation.upcoming,
        description: dictionary.navigation.upcoming_description,
        href: '/movies/upcoming',
        icon: Calendar,
      },
    ],
  },
  {
    label: dictionary.navigation.tv_shows,
    href: '/tv-shows',
    icon: Tv,
    items: [
      {
        label: dictionary.navigation.discover,
        description: dictionary.navigation.discover_description,
        href: '/tv-shows/discover',
        icon: Sparkles,
      },
      {
        label: dictionary.navigation.airing_today,
        description: dictionary.navigation.airing_today_description,
        href: '/tv-shows/airing-today',
        icon: Play,
      },
      {
        label: dictionary.navigation.on_the_air,
        description: dictionary.navigation.on_the_air_description,
        href: '/tv-shows/on-the-air',
        icon: Tv,
      },
      {
        label: dictionary.navigation.popular,
        description: dictionary.navigation.popular_description,
        href: '/tv-shows/popular',
        icon: Heart,
      },
      {
        label: dictionary.navigation.top_rated,
        description: dictionary.navigation.top_rated_description,
        href: '/tv-shows/top-rated',
        icon: Star,
      },
    ],
  },
  {
    label: dictionary.navigation.people,
    href: '/people/popular',
    icon: User,
  },
  {
    label: dictionary.navigation.lists,
    href: '/lists',
    icon: List,
  },
]
