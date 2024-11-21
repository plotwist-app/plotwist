import type { Dictionary } from '@/utils/dictionaries'
import * as icons from 'lucide-react'
import { v4 } from 'uuid'

const RandomIcon = () => {
  const iconNames = Object.keys(icons)
  const randomIconName = iconNames[Math.floor(Math.random() * iconNames.length)]
  const IconComponent = icons[
    randomIconName as keyof typeof icons
  ] as icons.LucideIcon

  return <IconComponent size={16} />
}

type ProfileAchievementsProps = {
  dictionary: Dictionary
}

export const ProfileAchievements = ({
  dictionary,
}: ProfileAchievementsProps) => {
  return (
    <div className="relative space-y-2 rounded-lg border p-4">
      <div className="absolute right-0 top-0 flex h-full w-full items-center justify-center rounded-lg border border-dashed bg-black/10 backdrop-blur-[1.5px] dark:bg-black/50">
        🚧 {dictionary.profile.work_in_progress}
      </div>

      <h3 className="font-semibold">{dictionary.profile.achievements}</h3>

      <div className="grid grid-cols-10 gap-2">
        {Array.from({ length: 30 }).map((_, index) => {
          return (
            <div
              className="flex aspect-square items-center justify-center rounded-lg bg-muted"
              key={v4()}
            >
              <RandomIcon />
            </div>
          )
        })}
      </div>
    </div>
  )
}
