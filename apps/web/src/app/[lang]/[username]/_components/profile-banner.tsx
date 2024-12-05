'use client'

import Image from 'next/image'
import { toast } from 'sonner'

import { ImagePicker } from '@/components/image-picker'

import type { GetUsersUsername200User } from '@/api/endpoints.schemas'
import { usePatchUser } from '@/api/users'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { useRouter } from 'next/navigation'

type ProfileBannerProps = {
  profile: GetUsersUsername200User
}

export const ProfileBanner = ({ profile }: ProfileBannerProps) => {
  const { user } = useSession()
  const { dictionary } = useLanguage()
  const { mutateAsync } = usePatchUser()
  const { refresh } = useRouter()

  const mode = user?.id === profile.id ? 'EDIT' : 'SHOW'

  if (mode === 'EDIT') {
    return (
      <ImagePicker.Root
        aspectRatio="banner"
        onSelect={async (imageSrc, onClose) => {
          await mutateAsync(
            { data: { bannerPath: imageSrc } },
            {
              onSuccess: () => {
                onClose()
                refresh()
                toast.success(dictionary.profile_banner.changed_successfully)
              },
            }
          )
        }}
      >
        <ImagePicker.Trigger>
          <section className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-none border aspect-banner lg:rounded-lg">
            {profile.bannerPath && (
              <Image
                src={profile.bannerPath}
                alt=""
                fill
                className="object-cover"
              />
            )}

            <div className="z-5 absolute h-full w-full bg-black/30 opacity-0 transition-all group-hover:opacity-100" />

            <p className="spacing z-[6] scale-0 text-xs font-bold uppercase tracking-wider text-white transition-all group-hover:scale-100">
              {dictionary.profile_banner.change_banner}
            </p>
          </section>
        </ImagePicker.Trigger>
      </ImagePicker.Root>
    )
  }

  return (
    <section className="relative flex aspect-banner w-full items-center justify-center overflow-hidden rounded-none border lg:rounded-lg">
      {profile.bannerPath && (
        <Image src={profile.bannerPath} alt="" fill className="object-cover" />
      )}
    </section>
  )
}
