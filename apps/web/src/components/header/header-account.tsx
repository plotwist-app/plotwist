'use client'

import { LogIn, LogOut, User as UserIcon } from 'lucide-react'
import Link from 'next/link'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@plotwist/ui/components/ui/dropdown-menu'

import { useLanguage } from '@/context/language'
import { tmdbImage } from '@/utils/tmdb/image'
import { HeaderNavigationDrawerConfigs } from './header-navigation-drawer-configs'

import { logout } from '@/actions/auth/logout'
import { useSession } from '@/context/session'
import type { User } from '@/types/user'

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

  if (user.avatarUrl) {
    return (
      <AvatarImage
        src={user.avatarUrl}
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
          <form action={() => logout(language)}>
            <DropdownMenuItem onClick={() => {}} asChild>
              <button type="submit" className="w-full">
                <LogOut className="mr-1 size-3" />
                {dictionary.logout}
              </button>
            </DropdownMenuItem>
          </form>
        ) : (
          <DropdownMenuItem asChild>
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
