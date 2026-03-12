import { BarChart3, Compass, ListVideo, Tv } from 'lucide-react'
import type { Dictionary } from '@/utils/dictionaries'

type FeaturesProps = {
  dictionary: Dictionary
}

const FEATURES = [
  { Icon: Tv },
  { Icon: Compass },
  { Icon: ListVideo },
  { Icon: BarChart3 },
] as const

export function Features({ dictionary }: FeaturesProps) {
  const features = [
    {
      title: dictionary.feature_track_title,
      description: dictionary.feature_track_description,
    },
    {
      title: dictionary.feature_discover_title,
      description: dictionary.feature_discover_description,
    },
    {
      title: dictionary.feature_lists_title,
      description: dictionary.feature_lists_description,
    },
    {
      title: dictionary.feature_stats_title,
      description: dictionary.feature_stats_description,
    },
  ]

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 lg:px-0 lg:py-32">
      <div className="mx-auto max-w-2xl text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          {dictionary.features_title}
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
        {features.map((feature, i) => {
          const { Icon } = FEATURES[i]
          const isLarge = i === 0 || i === 3

          return (
            <div
              key={feature.title}
              className={`
                group relative overflow-hidden rounded-2xl
                bg-foreground/[0.02] dark:bg-foreground/[0.03]
                ring-1 ring-foreground/[0.06]
                p-8 transition-all duration-300
                hover:bg-foreground/[0.04] hover:ring-foreground/[0.1]
                ${isLarge ? 'md:col-span-2 md:p-10' : 'md:col-span-1'}
              `}
            >
              <div className="relative flex flex-col gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-foreground/[0.05] dark:bg-foreground/[0.06]">
                  <Icon className="h-5 w-5 text-foreground/70" />
                </div>

                <h3 className="text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>

                <p
                  className={`
                    text-muted-foreground leading-relaxed
                    ${isLarge ? 'max-w-md text-base' : 'text-sm'}
                  `}
                >
                  {feature.description}
                </p>
              </div>

              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-foreground/[0.02] transition-transform duration-500 group-hover:scale-150" />
            </div>
          )
        })}
      </div>
    </section>
  )
}
