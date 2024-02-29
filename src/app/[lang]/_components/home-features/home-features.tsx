import { cn } from '@/lib/utils'
import { Language } from '@/types/languages'
import {
  ListChecks,
  LucideIcon,
  MessageSquare,
  Globe,
  Share,
  Users,
} from 'lucide-react'
import Image from 'next/image'
import { ComponentProps, PropsWithChildren } from 'react'

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

      <div className="relative flex h-full w-full select-none items-center justify-center overflow-hidden rounded-lg border bg-muted text-muted-foreground shadow">
        {children}
      </div>
    </li>
  )
}

type HomeFeaturesProps = { language: Language }

export const HomeFeatures = ({ language }: HomeFeaturesProps) => {
  return (
    <section className="border-y bg-muted/10 py-16">
      <div className="mx-auto max-w-article space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-2xl font-bold">[TMDB] Features</h2>

          <p className="w-2/3 text-center text-muted-foreground">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo iste
            sunt alias ipsum minima aspernatur excepturi cum perferendis dolorum
            nostrum, consequatur ullam! Veniam enim neque sint adipisci labore
            ratione quidem.
          </p>
        </div>

        <ul className="grid grid-cols-3 gap-4">
          <HomeFeature
            title="Lists"
            description="Create and manage status of your movies, series and animes in one beautiful place."
            className="col-span-2 aspect-[16/9]"
            icon={ListChecks}
          >
            <Image
              alt="Lists"
              fill
              className="hidden object-cover dark:block"
              quality={100}
              src={`/images/home/list/watchlist-${language}-dark.jpg`}
            />

            <Image
              alt="Lists"
              fill
              className="block object-cover dark:hidden"
              quality={100}
              src={`/images/home/list/watchlist-${language}-light.jpg`}
            />
          </HomeFeature>

          <HomeFeature
            icon={MessageSquare}
            title="Reviews"
            description="Write reviews about what you're watching and let the world know your opinion."
            className="col-span-1 "
          >
            <span className="animate-pulse">Work in progress.</span>
          </HomeFeature>

          <HomeFeature
            icon={Globe}
            title="Multi-lang support"
            description="We support different languages to bring different countries."
            className="col-span-1 "
          />

          <HomeFeature
            icon={Users}
            title="Communities"
            description="Create or participate in specific niche communities."
            className="col-span-2 aspect-[16/9]"
          >
            <span className="animate-pulse">Work in progress.</span>
          </HomeFeature>
        </ul>
      </div>
    </section>
  )
}
