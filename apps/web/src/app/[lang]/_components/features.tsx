import { BarChart3, Compass, ListVideo, Tv } from 'lucide-react'
import type { Dictionary } from '@/utils/dictionaries'

type FeaturesProps = {
  dictionary: Dictionary
}

const ICONS = [Tv, Compass, ListVideo, BarChart3] as const

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
    <section className="mx-auto max-w-6xl px-4 py-24 lg:px-0">
      <h2 className="mb-12 text-center text-2xl font-semibold md:text-4xl">
        {dictionary.features_title}
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, i) => {
          const Icon = ICONS[i]
          return (
            <div
              key={feature.title}
              className="group flex flex-col gap-3 rounded-lg border bg-background bg-gradient-to-b from-transparent to-muted/30 p-6 transition-colors hover:border-foreground/20"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                <Icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="font-medium">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
