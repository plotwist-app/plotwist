import { cn } from '@/lib/utils'
import { Language } from '@/types/languages'
import { Dictionary } from '@/utils/dictionaries'
import {
  ListChecks,
  LucideIcon,
  MessageSquare,
  Globe as GlobeLucide,
  Users,
} from 'lucide-react'
import Image from 'next/image'
import { ComponentProps, PropsWithChildren } from 'react'
import { Globe } from '../globe'

type HomeFeatureProps = {
  icon: LucideIcon
  title: string
  description: string
} & ComponentProps<'li'> &
  PropsWithChildren

const HomeFeature = ({
  icon: Icon,
  title,
  description,
  className,
  children,
  ...props
}: HomeFeatureProps) => {
  return (
    <li
      className={cn(
        'flex flex-col space-y-4 rounded-lg border bg-background bg-gradient-to-b from-transparent to-muted/30 p-6',
        className,
      )}
      {...props}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-4">
          <Icon className="h-6 w-6 text-muted-foreground" />
          <span className="text-lg font-semibold">{title}</span>
        </div>

        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="pointer-events-none relative flex h-full w-full select-none items-center justify-center overflow-hidden rounded-lg border text-muted-foreground shadow">
        {children}
      </div>
    </li>
  )
}

type HomeFeaturesProps = { language: Language; dictionary: Dictionary }

export const HomeFeatures = ({ language, dictionary }: HomeFeaturesProps) => {
  const {
    home: {
      features: {
        section_title: title,
        section_description: description,
        lists,
        communities,
        multi_lang_support: multiLangSupport,
        reviews,
      },
    },
  } = dictionary

  return (
    <section className="border-y bg-muted/10 py-16">
      <div className="mx-auto max-w-article space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="w-2/3 text-center text-muted-foreground">
            {description}
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-3 lg:p-0">
          <HomeFeature
            title={lists.title}
            description={lists.description}
            className="col-span-1 aspect-[16/9] lg:col-span-2"
            icon={ListChecks}
          >
            <Image
              alt={lists.title}
              fill
              className="hidden object-cover dark:block"
              quality={100}
              src={`/images/home/list/watchlist-${language}-dark.jpg`}
            />

            <Image
              alt={lists.title}
              fill
              className="block object-cover dark:hidden"
              quality={100}
              src={`/images/home/list/watchlist-${language}-light.jpg`}
            />
          </HomeFeature>

          <HomeFeature
            icon={MessageSquare}
            title={reviews.title}
            description={reviews.description}
            className="col-span-1"
          >
            <span className="animate-pulse">Work in progress...</span>
          </HomeFeature>

          <HomeFeature
            icon={GlobeLucide}
            title={multiLangSupport.title}
            description={multiLangSupport.description}
            className="col-span-1"
          >
            <Globe />
          </HomeFeature>

          <HomeFeature
            icon={Users}
            title={communities.title}
            description={communities.description}
            className="col-span-1  aspect-[16/9] lg:col-span-2"
          >
            <span className="animate-pulse">Work in progress...</span>
          </HomeFeature>
        </ul>
      </div>
    </section>
  )
}
