'use client'

import { useAuth } from '@/context/auth'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { tmdbImage } from '@/utils/tmdb/image'
import { Eye, List, LogIn, LogOut, Star, User } from 'lucide-react'
import { Profile } from '@/types/supabase'
import Link from 'next/link'
import { useLanguage } from '@/context/language'
import { HeaderNavigationDrawerConfigs } from './header-navigation-drawer-configs'

type AvatarContentProps = {
  user: Profile | null
}

const AvatarContent = ({ user }: AvatarContentProps) => {
  if (!user) {
    return (
      <AvatarFallback>
        <User className="size-4 text-muted-foreground" />
      </AvatarFallback>
    )
  }

  if (user.image_path) {
    return (
      <AvatarImage
        src={tmdbImage(user.image_path)}
        alt={user.username}
        className="object-cover"
      />
    )
  }

  return <AvatarFallback>{user.username[0]}</AvatarFallback>
}

export const HeaderAccount = () => {
  const { user, logout } = useAuth()
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
            <div className="flex">
              <Avatar className="size-8 cursor-pointer">
                <AvatarContent user={user} />
              </Avatar>
            </div>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem disabled={!user}>
                <Star className="mr-1 size-3" />
                Reviews
              </DropdownMenuItem>

              <DropdownMenuItem disabled={!user}>
                <List className="mr-1 size-3" />
                Lists
              </DropdownMenuItem>

              <DropdownMenuItem disabled={!user}>
                <Eye className="mr-1 size-3" />
                Watched
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
          </>
        )}

        <HeaderNavigationDrawerConfigs />
        <DropdownMenuSeparator />

        {user ? (
          <DropdownMenuItem onClick={() => logout()}>
            <LogOut className="mr-1 size-3" />
            Log out
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            asChild
            className="font-medium text-muted-foreground"
          >
            <Link href={`/${language}/login`}>
              <LogIn className="mr-1 size-3" />
              {dictionary.login}
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
