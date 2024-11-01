import { useRouter } from 'next/navigation'
import { LogOut, User as UserIcon } from 'lucide-react'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'

import { tmdbImage } from '@/utils/tmdb/image'

import { useAuth } from '@/context/auth'
import { useLanguage } from '@/context/language'
import { PostLogin200User } from '@/api/endpoints.schemas'

type HeaderNavigationDrawerUserProps = {
  user: PostLogin200User
}

export const HeaderNavigationDrawerUser = ({
  user,
}: HeaderNavigationDrawerUserProps) => {
  const { push } = useRouter()
  const { language } = useLanguage()

  if (!user) return

  const ACTIONS = [
    {
      label: 'Profile',
      icon: UserIcon,
      fn: () => push(`/${language}/${user.username}`),
    },
    {
      label: 'Log out',
      icon: LogOut,
      fn: () => console.log("logout"),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="">
          <span className="font-medium">{user.username}</span>
          <p className="text-muted-foreground">{user.email}</p>
        </div>

        <Avatar className="size-6 border">
          {user.imagePath && (
            <AvatarImage
              src={tmdbImage(user.imagePath, 'w500')}
              className="object-cover"
            />
          )}

          <AvatarFallback>{user.username?.at(0)}</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-col">
        {ACTIONS.map((action) => (
          <button
            className="flex items-center justify-between gap-2 rounded-md p-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            onClick={action.fn}
            key={action.label}
          >
            {action.label}

            {action.icon && <action.icon className="size-4" />}
          </button>
        ))}
      </div>
    </div>
  )
}
