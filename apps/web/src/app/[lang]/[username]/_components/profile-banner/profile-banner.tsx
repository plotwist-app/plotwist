'use client'

import { Profile } from '@/types/supabase'
import { ProfileBannerEdit } from './profile-banner-edit'
import { useAuth } from '@/context/auth'
import Image from 'next/image'
import { tmdbImage } from '@/utils/tmdb/image'
import { useQuery } from '@tanstack/react-query'
import { getProfileByUsername } from '@/services/api/profiles'

type ProfileBannerProps = {
  profileId: Profile['id']
  profileUsername: Profile['username']
}

export const ProfileBanner = ({
  profileId,
  profileUsername,
}: ProfileBannerProps) => {
  const { user } = useAuth()

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
      <ProfileBannerEdit>
        {bannerPath && (
          <Image
            src={tmdbImage(bannerPath)}
            alt=""
            fill
            className="object-cover"
          />
        )}
      </ProfileBannerEdit>
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
