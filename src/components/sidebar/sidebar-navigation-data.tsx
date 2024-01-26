import {
  Calendar,
  Clapperboard,
  Heart,
  Home,
  List,
  Play,
  Sparkles,
  Star,
  Tv,
  User,
} from 'lucide-react'
import { SidebarNavigationItemProps } from '.'
import { Dictionary } from '@/utils/dictionaries/get-dictionaries.types'

type buildLanguageNavigation = (
  dictionary: Dictionary,
) => SidebarNavigationItemProps[]

export const buildLanguageNavigation: buildLanguageNavigation = (
  dictionary,
) => [
  {
    label: dictionary.navigation.dashboard,
    href: '/app',
    icon: Home,
  },
  {
    label: dictionary.navigation.movies,
    href: '/app/movies',
    icon: Clapperboard,
    items: [
      {
        label: dictionary.navigation.discover,
        href: '/app/movies/discover',
        icon: Sparkles,
      },
      {
        label: dictionary.navigation.now_playing,
        href: '/app/movies/now-playing',
        icon: Play,
      },
      {
        label: dictionary.navigation.popular,
        href: '/app/movies/popular',
        icon: Heart,
      },
      {
        label: dictionary.navigation.top_rated,
        href: '/app/movies/top-rated',
        icon: Star,
      },
      {
        label: dictionary.navigation.upcoming,
        href: '/app/movies/upcoming',
        icon: Calendar,
      },
    ],
  },
  {
    label: dictionary.navigation.tv_shows,
    href: '/app/tv-shows',
    icon: Tv,
    items: [
      {
        label: dictionary.navigation.airing_today,
        href: '/app/tv-shows/airing-today',
        icon: Play,
      },
      {
        label: dictionary.navigation.on_the_air,
        href: '/app/tv-shows/on-the-air',
        icon: Tv,
      },
      {
        label: dictionary.navigation.popular,
        href: '/app/tv-shows/popular',
        icon: Heart,
      },
      {
        label: dictionary.navigation.top_rated,
        href: '/app/tv-shows/top-rated',
        icon: Star,
      },
    ],
  },
  {
    label: dictionary.navigation.people,
    href: '/app/people',
    icon: User,
    items: [
      {
        label: dictionary.navigation.popular,
        href: '/app/people/popular',
        icon: Heart,
      },
    ],
  },
  {
    label: dictionary.navigation.lists,
    href: '/app/lists',
    icon: List,
  },
]
