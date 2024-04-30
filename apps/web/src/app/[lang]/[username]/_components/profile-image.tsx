import { Profile } from '@/types/supabase'
import { Pencil } from 'lucide-react'

type ProfileImageProps = {
  profile: Profile
}

export const ProfileImage = ({ profile }: ProfileImageProps) => {
  return (
    <div className="group relative z-50 flex aspect-square w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border bg-muted text-2xl">
      {profile.username[0].toUpperCase()}

      <div className="absolute flex h-full w-full items-center justify-center bg-black/50 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100">
        <div className="scale-0 text-white transition-all group-hover:scale-100">
          <Pencil />
        </div>
      </div>
    </div>
  )
}
