import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { tmdbImage } from '@/utils/tmdb/image'
import { Checkbox } from '../ui/checkbox'
import { Profile } from '@/types/supabase'
import { Skeleton } from '../ui/skeleton'

type RecommendationDialogProfileProps = {
  profile: Profile
  checked: boolean
  handleSelect: (action: 'remove' | 'add', profile: Profile) => void
}

export const RecommendationDialogProfile = ({
  profile,
  checked,
  handleSelect,
}: RecommendationDialogProfileProps) => {
  return (
    <div
      className="flex cursor-pointer items-center justify-between gap-4 px-4 py-2 hover:bg-muted"
      onClick={() => handleSelect(checked ? 'remove' : 'add', profile)}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 text-xs">
          {profile.image_path && (
            <AvatarImage
              src={tmdbImage(profile.image_path, 'w500')}
              className="object-cover"
            />
          )}

          <AvatarFallback className="border">
            {profile.username[0]}
          </AvatarFallback>
        </Avatar>

        <span className="text-sm">{profile.username}</span>
      </div>

      <Checkbox
        onCheckedChange={(newChecked) =>
          handleSelect(newChecked ? 'add' : 'remove', profile)
        }
        checked={checked}
      />
    </div>
  )
}

export const RecommendationDialogProfileSkeleton = () => {
  return (
    <div className="py- flex items-center justify-between gap-4 px-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-[2ex] w-[10ch]" />
      </div>

      <Skeleton className="h-4 w-4" />
    </div>
  )
}
