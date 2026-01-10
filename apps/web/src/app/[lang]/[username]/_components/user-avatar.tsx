'use client'

import { Pencil } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { GetUsersUsername200User } from '@/api/endpoints.schemas'
import { usePatchUser } from '@/api/users'
import { ImagePicker } from '@/components/image-picker'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { cn } from '@/lib/utils'

type UserAvatarProps = {
  user: GetUsersUsername200User
}

export const UserAvatar = ({ user }: UserAvatarProps) => {
  const { dictionary } = useLanguage()
  const session = useSession()
  const patchUser = usePatchUser()
  const { refresh } = useRouter()

  const mode = user.id === session.user?.id ? 'EDIT' : 'SHOW'

  const { avatarUrl, username } = user

  if (mode === 'SHOW') {
    return (
      <div className="relative z-40 flex aspect-square  items-center justify-center overflow-hidden rounded-full border bg-muted text-3xl -mt-20 w-40">
        {avatarUrl ? (
          <Image src={avatarUrl} fill alt="" className="object-cover" />
        ) : (
          username[0].toUpperCase()
        )}
      </div>
    )
  }

  return (
    <ImagePicker.Root
      variant="avatar"
      onSelect={async (imageUrl, closeModal) => {
        await patchUser.mutateAsync(
          {
            data: { avatarUrl: imageUrl },
          },
          {
            onSettled: () => {
              refresh()
              closeModal()
              toast.success(dictionary.profile_image_changed_successfully)
            },
          }
        )
      }}
    >
      <ImagePicker.Trigger>
        <div
          className={cn(
            'group relative z-40 flex w-40 cursor-pointer items-center justify-center overflow-hidden rounded-full border bg-muted text-3xl aspect-square -mt-20'
          )}
        >
          {avatarUrl ? (
            <Image src={avatarUrl} fill alt="" className="object-cover" />
          ) : (
            username[0].toUpperCase()
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
