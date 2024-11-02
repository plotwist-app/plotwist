'use client'

import Image from 'next/image'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'

import { ImagePicker } from '@/components/image-picker'

import { tmdbImage } from '@/utils/tmdb/image'
import { useLanguage } from '@/context/language'
import { useProfile } from '@/hooks/use-profile'
import { useSession } from '@/context/session'
import { GetUsersUsername200User } from '@/api/endpoints.schemas'

type ProfileBannerProps = {
  profile: GetUsersUsername200User
}

export const ProfileBanner = ({ profile }: ProfileBannerProps) => {
  const { user } = useSession()
  const { dictionary } = useLanguage()
  const { updateBannerPathMutation } = useProfile()
  const { username } = useParams()

  const mode = user?.id === profile.id ? 'EDIT' : 'SHOW'

  if (mode === 'EDIT') {
    return (
      <ImagePicker.Root
        onSelect={(image) =>
          updateBannerPathMutation.mutate(
            {
              newBannerPath: image.file_path,
              username: String(username),
            },

            {
              onSettled: () => {
                toast.success(dictionary.profile_banner.changed_successfully)
              },
            },
          )
        }
      >
        <ImagePicker.Trigger>
          <section className="group relative flex h-[30dvh] max-h-[720px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-none border lg:h-[55dvh] lg:rounded-lg">
            {profile.bannerPath && (
              <Image
                src={tmdbImage(profile.bannerPath)}
                alt=""
                fill
                className="object-cover"
              />
            )}

            <div className="z-5 absolute h-full w-full bg-black/30 opacity-0 transition-all group-hover:opacity-100" />

            <p className="spacing z-[6] scale-0 text-xs  font-bold uppercase tracking-wider text-white transition-all group-hover:scale-100">
              {dictionary.profile_banner.change_banner}
            </p>
          </section>
        </ImagePicker.Trigger>
      </ImagePicker.Root>
    )
  }

  return (
    <section className="relative flex h-[30dvh] max-h-[720px] w-full items-center justify-center overflow-hidden rounded-none border lg:h-[55dvh] lg:rounded-lg">
      {profile.bannerPath && (
        <Image
          src={tmdbImage(profile.bannerPath)}
          alt=""
          fill
          className="object-cover"
        />
      )}
    </section>
  )
}
