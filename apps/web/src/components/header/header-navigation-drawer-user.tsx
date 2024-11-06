import { LogOut } from 'lucide-react'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'

import { tmdbImage } from '@/utils/tmdb/image'

import { useLanguage } from '@/context/language'
import { logout } from '@/actions/auth/logout'
import Link from 'next/link'
import { User } from '@/types/user'

type HeaderNavigationDrawerUserProps = {
  user: User
}

export const HeaderNavigationDrawerUser = ({
  user,
}: HeaderNavigationDrawerUserProps) => {
  const { language, dictionary } = useLanguage()

  if (!user) return

  return (
    <div className="space-y-4">
      <Link
        href={`/${language}/${user.username}`}
        className="flex items-center justify-between px-2"
      >
        <span className="font-medium">{user.username}</span>

        <Avatar className="size-10 border">
          {user.imagePath && (
            <AvatarImage
              src={tmdbImage(user.imagePath, 'w500')}
              className="object-cover"
            />
          )}

          <AvatarFallback>{user.username?.at(0)}</AvatarFallback>
        </Avatar>
      </Link>

      <form action={logout} className="w-full">
        <button
          className="flex items-center justify-between gap-2 rounded-md p-2 text-sm font-medium hover:bg-muted w-full"
          type="submit"
        >
          {dictionary.logout}
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  )
}
