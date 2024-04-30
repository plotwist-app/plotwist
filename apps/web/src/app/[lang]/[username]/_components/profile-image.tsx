'use client'

import { ImagePicker } from '@/components/image-picker'
import { useProfile } from '@/hooks/use-profile'
import { getProfileByUsername } from '@/services/api/profiles'
import { Profile } from '@/types/supabase'
import { tmdbImage } from '@/utils/tmdb/image'
import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

type ProfileImageProps = {
  profile: Profile
}

export const ProfileImage = ({ profile }: ProfileImageProps) => {
  const { username } = profile

  const { data: profileImagePath } = useQuery({
    queryKey: ['profile-image', username],
    queryFn: async () => await getProfileByUsername(username),
    select: (data) => {
      return data?.image_path
    },
  })

  const { updateImagePathMutation } = useProfile()

  return (
    <ImagePicker.Root
      onSelect={(image) =>
        updateImagePathMutation.mutate(
          {
            newImagePath: image.file_path,
            username: String(username),
          },

          {
            onSettled: () => {
              toast.success('profile image changed successfully.')
            },
          },
        )
      }
    >
      <ImagePicker.Trigger>
        <div className="group relative z-50 flex aspect-square w-48 cursor-pointer items-center justify-center overflow-hidden rounded-lg border bg-muted text-3xl">
          {profileImagePath ? (
            <Image
              src={tmdbImage(profileImagePath)}
              fill
              alt=""
              className="object-cover"
            />
          ) : (
            profile.username[0].toUpperCase()
          )}

          <div className="absolute flex h-full w-full items-center justify-center bg-black/50 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100">
            <div className="scale-0 text-white transition-all group-hover:scale-100">
              <Pencil />
            </div>
          </div>
        </div>
      </ImagePicker.Trigger>
    </ImagePicker.Root>
  )
}
