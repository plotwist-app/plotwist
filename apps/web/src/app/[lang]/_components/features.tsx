import { BarChart3, Compass, ListVideo, Tv } from 'lucide-react'
import type { Dictionary } from '@/utils/dictionaries'
import { ActivityFeedCard } from './social-proof'

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

  const featureCard = (feature: (typeof features)[number], i: number) => {
    const { Icon } = FEATURES[i]

    return (
      <div
        key={feature.title}
        className="group overflow-hidden rounded-2xl bg-foreground/[0.02] dark:bg-foreground/[0.03] ring-1 ring-foreground/[0.06] p-6 transition-colors duration-200 hover:bg-foreground/[0.04] hover:ring-foreground/[0.1]"
      >
        <div className="flex flex-col gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/[0.05] dark:bg-foreground/[0.08]">
            <Icon className="h-5 w-5 text-foreground/70" />
          </div>

          <h3 className="text-base font-semibold tracking-tight">
            {feature.title}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 lg:px-0 lg:py-24">
      <div className="mx-auto max-w-2xl text-center mb-12">
        <h2 className="text-2xl font-bold tracking-tight md:text-4xl">
          {dictionary.features_title}
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="flex flex-col gap-3 md:col-span-2">
          <div className="grid gap-3 md:grid-cols-2">
            {featureCard(features[0], 0)}
            {featureCard(features[1], 1)}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {featureCard(features[2], 2)}
            {featureCard(features[3], 3)}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-foreground/[0.02] dark:bg-foreground/[0.03] ring-1 ring-foreground/[0.06] p-4">
          <ActivityFeedCard />
        </div>
      </div>
    </section>
  )
}
