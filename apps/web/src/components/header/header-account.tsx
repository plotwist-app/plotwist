'use client'

import Link from 'next/link'
import { LogIn, LogOut, User as UserIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@plotwist/ui/components/ui/dropdown-menu'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'

import { tmdbImage } from '@/utils/tmdb/image'
import { useLanguage } from '@/context/language'
import { HeaderNavigationDrawerConfigs } from './header-navigation-drawer-configs'

import { useSession } from '@/context/session'
import { User } from '@/types/user'
import { logout } from '@/actions/auth/logout'

type AvatarContentProps = {
  user: User
}

const AvatarContent = ({ user }: AvatarContentProps) => {
  if (!user) {
    return (
      <AvatarFallback>
        <UserIcon className="size-4 text-muted-foreground" />
      </AvatarFallback>
    )
  }

  if (user.imagePath) {
    return (
      <AvatarImage
        src={tmdbImage(user.imagePath)}
        alt={user.username}
        className="object-cover"
      />
    )
  }

  return <AvatarFallback>{user.username?.at(0)}</AvatarFallback>
}

export const HeaderAccount = () => {
  const { user } = useSession()
  const { language, dictionary } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8 cursor-pointer border">
          <AvatarContent user={user} />
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72">
        {user && (
          <>
            <Link
              href={`/${language}/${user.username}`}
              className="flex items-center gap-2 p-1 text-sm"
            >
              <Avatar className="size-8 cursor-pointer">
                <AvatarContent user={user} />
              </Avatar>
              {user.username}
            </Link>

            <DropdownMenuSeparator />
          </>
        )}

        <HeaderNavigationDrawerConfigs />
        <DropdownMenuSeparator />

        {user ? (
          // TODO: LOGOUT
          <form action={logout}>
            <DropdownMenuItem onClick={() => {}} asChild>
              <button type="submit" className="w-full">
                <LogOut className="mr-1 size-3" />
                {dictionary.logout}
              </button>
            </DropdownMenuItem>
          </form>
        ) : (
          <DropdownMenuItem
            asChild
            className="font-medium text-muted-foreground"
          >
            <Link href={`/${language}/sign-in`}>
              <LogIn className="mr-1 size-3" />
              {dictionary.login}
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
