'use client'

import { GetUsersUsername200User } from '@/api/endpoints.schemas'
import { usePatchUserImage } from '@/api/users'
import { ImagePicker } from '@/components/image-picker'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { tmdbImage } from '@/utils/tmdb/image'
import { Pencil } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type ProfileImageProps = {
  profile: GetUsersUsername200User
}

export const ProfileImage = ({ profile }: ProfileImageProps) => {
  const { dictionary } = useLanguage()
  const { user } = useSession()
  const useUpdateUserImage = usePatchUserImage()
  const { refresh } = useRouter()

  const mode = user?.id === profile.id ? 'EDIT' : 'SHOW'

  if (mode === 'SHOW') {
    return (
      <div className="relative z-40 flex aspect-square w-32 items-center justify-center overflow-hidden rounded-full border bg-muted text-3xl lg:w-48">
        {profile.imagePath ? (
          <Image
            src={tmdbImage(profile.imagePath)}
            fill
            alt=""
            className="object-cover"
          />
        ) : (
          profile.username?.at(0)?.toUpperCase()
        )}
      </div>
    )
  }

  return (
    <ImagePicker.Root
      onSelect={(image, closeModal) =>
        useUpdateUserImage.mutateAsync(
          {
            data: { imagePath: image.file_path },
          },

          {
            onSettled: () => {
              refresh()
              closeModal()
              toast.success(dictionary.profile_image_changed_successfully)
            },
          },
        )
      }
    >
      <ImagePicker.Trigger>
        <div className="group relative z-40 flex aspect-square w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border bg-muted text-3xl lg:w-48">
          {profile.imagePath ? (
            <Image
              src={tmdbImage(profile.imagePath)}
              fill
              alt=""
              className="object-cover"
            />
          ) : (
            profile.username?.at(0)?.toUpperCase()
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
