'use client'

import { Profile } from '@/types/supabase'
import { useAuth } from '@/context/auth'
import Image from 'next/image'
import { tmdbImage } from '@/utils/tmdb/image'
import { useQuery } from '@tanstack/react-query'
import { getProfileByUsername } from '@/services/api/profiles'
import { ImagePicker } from '@/components/image-picker'
import { useLanguage } from '@/context/language'

type ProfileBannerProps = {
  profileId: Profile['id']
  profileUsername: Profile['username']
}

export const ProfileBanner = ({
  profileId,
  profileUsername,
}: ProfileBannerProps) => {
  const { user } = useAuth()
  const { dictionary } = useLanguage()

  const { data: bannerPath } = useQuery({
    queryKey: ['profile-banner', profileUsername],
    queryFn: async () => await getProfileByUsername(profileUsername),
    select: (data) => {
      return data?.banner_path
    },
  })

  const mode = user?.id === profileId ? 'EDIT' : 'SHOW'

  if (mode === 'EDIT') {
    return (
      <ImagePicker.Root title={dictionary.profile_banner.change_profile_banner}>
        <section className="group relative flex h-[30dvh] max-h-[720px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-none border lg:h-[55dvh] lg:rounded-lg">
          {bannerPath && (
            <Image
              src={tmdbImage(bannerPath)}
              alt=""
              fill
              className="object-cover"
            />
          )}

          <div className="absolute z-20 h-full w-full bg-black/30 opacity-0 transition-all group-hover:opacity-100" />

          <p className="spacing z-30 scale-0 text-xs  font-bold uppercase tracking-wider text-white transition-all group-hover:scale-100">
            {dictionary.profile_banner.change_banner}
          </p>
        </section>
      </ImagePicker.Root>
    )
  }

  return (
    <section className="relative flex h-[30dvh] max-h-[720px] w-full items-center justify-center overflow-hidden rounded-none border lg:h-[55dvh] lg:rounded-lg">
      {bannerPath && (
        <Image
          src={tmdbImage(bannerPath)}
          alt=""
          fill
          className="object-cover"
        />
      )}
    </section>
  )
}
