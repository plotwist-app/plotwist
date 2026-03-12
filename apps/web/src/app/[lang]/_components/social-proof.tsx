'use client'

import { AnimatedList } from '@plotwist/ui/components/ui/animated-list'

const ACTIVITIES = [
  { name: 'Maria', action: 'added', title: 'Breaking Bad' },
  { name: 'João', action: 'rated', title: 'Oppenheimer', detail: '★★★★★' },
  { name: 'Ana', action: 'finished', title: 'Succession S3' },
  { name: 'Lucas', action: 'discovered', title: 'Spirited Away' },
  { name: 'Sophie', action: 'added', title: 'Arcane' },
  { name: 'Yuki', action: 'rated', title: 'Attack on Titan', detail: '★★★★' },
  { name: 'Carlos', action: 'finished', title: 'The Bear S2' },
  { name: 'Léa', action: 'discovered', title: 'Parasite' },
  { name: 'Tom', action: 'added', title: 'Shogun' },
  { name: 'Mia', action: 'rated', title: 'Dune Part Two', detail: '★★★★★' },
]

function ActivityItem({
  name,
  action,
  title,
  detail,
}: (typeof ACTIVITIES)[number]) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-background/60 ring-1 ring-foreground/[0.04] px-3 py-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground/60 text-[10px] font-semibold">
        {name[0]}
      </div>
      <p className="text-xs truncate">
        <span className="font-medium">{name}</span>
        <span className="text-muted-foreground"> {action} </span>
        <span className="font-medium">{title}</span>
        {detail && (
          <span className="text-muted-foreground/40 ml-1">{detail}</span>
        )}
      </p>
    </div>
  )
}

export function ActivityFeedCard() {
  return (
    <div className="relative h-full min-h-[280px]">
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 55%, transparent 100%)',
        }}
      >
        <AnimatedList delay={2200}>
          {ACTIVITIES.map(activity => (
            <ActivityItem key={activity.title} {...activity} />
          ))}
        </AnimatedList>
      </div>
    </div>
  )
}
