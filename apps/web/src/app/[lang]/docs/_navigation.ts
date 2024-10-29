import { Dictionary } from '@/utils/dictionaries'

type NavigationItem = {
  name: string
  href: string
  isNew?: boolean
  isDisabled?: boolean
  // isUpdated?: boolean
}

type NavigationGroup = {
  name: string
  children: NavigationItem[]
}

export const buildNavigation = (dictionary: Dictionary): NavigationGroup[] => [
  {
    name: 'Plotwist',
    children: [
      {
        name: dictionary.about,
        href: '/docs',
        isNew: true,
      },
      // {
      //   name: 'Membership',
      //   href: '/membership',
      // },
      // {
      //   name: 'Usage',
      //   href: '/membership',
      // },
      {
        name: dictionary.roadmap,
        href: '/about/roadmap',
        isDisabled: true,
      },
    ],
  },
  // {
  //   name: 'Importing data',
  //   children: [
  //     {
  //       name: 'Letterboxd',
  //       href: '/etterboxd',
  //       isDisabled: true,
  //     },
  //     {
  //       name: 'MyAnimeList',
  //       href: '/my-anime-list',
  //       isDisabled: true,
  //     },
  //   ],
  // },
]
