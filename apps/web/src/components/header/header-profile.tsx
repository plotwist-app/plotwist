'use client'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { tmdbImage } from '@/utils/tmdb/image'
import { Award, List, LogOut, Star, User } from 'lucide-react'
import { useAuth } from '@/context/auth'
import { useLanguage } from '@/context/language'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu'
import { useRouter } from 'next/navigation'
import { ProBadge } from '../pro-badge'

export const HeaderProfile = () => {
  const { user, logout } = useAuth()
  const { dictionary, language } = useLanguage()
  const initial = user?.username[0].toUpperCase()
  const router = useRouter()

  const handleGetUrl = (url: string) => {
    router.push(`/${language}/${user?.username}` + '?' + `tab=${url}`)
  }

  return (
    <div>
      {!user ? (
        <Link
          href={`/${language}/sign-up`}
          className="block cursor-pointer select-none space-y-1 rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="flex items-center gap-2">
            <User width={12} height={12} />
            <p className="text-sm font-medium leading-none">
              {dictionary.create_account}
            </p>
          </div>
        </Link>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="size-[34px] border">
              {user.image_path && (
                <AvatarImage
                  src={tmdbImage(user.image_path, 'w500')}
                  className="object-cover"
                />
              )}
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <Link
                  href={`/${language}/${user?.username}`}
                  className="flex items-center"
                >
                  <Avatar className="mr-2 h-7 w-7 border text-[10px]">
                    {user.image_path && (
                      <AvatarImage
                        src={tmdbImage(user.image_path, 'w500')}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback>{initial}</AvatarFallback>
                  </Avatar>
                  <p>{user.username}</p>
                </Link>
              </DropdownMenuLabel>
              <DropdownMenuItem className=" outline-none">
                <div
                  className="flex cursor-pointer items-center gap-1.5 rounded-md p-2 hover:bg-muted"
                  onClick={() => handleGetUrl('reviews')}
                >
                  <Star size={16} className="ml-1.5" />
                  <p className="text-sm">{dictionary.profile.reviews}</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className=" outline-none">
                <div
                  onClick={() => handleGetUrl('lists')}
                  className="flex cursor-pointer items-center gap-1.5 rounded-md p-2 hover:bg-muted"
                >
                  <List size={16} className="ml-1.5" />
                  <p className="text-sm">{dictionary.profile.lists}</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className=" outline-none">
                <div
                  onClick={() => handleGetUrl('achievements')}
                  className="flex cursor-pointer items-center gap-1.5 rounded-md p-2 hover:bg-muted"
                >
                  <Award size={16} className="ml-1.5" />
                  <p className="text-sm">{dictionary.profile.achievements}</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className=" cursor-pointer  outline-none">
                <Link
                  href={`/${language}/pricing`}
                  className="flex cursor-pointer items-center gap-1.5 rounded-md p-2 hover:bg-muted"
                >
                  <p className="ml-1.5 text-sm">
                    {dictionary.become_pro_button}
                  </p>
                  <ProBadge />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className=" cursor-pointer  outline-none"
                onClick={() => logout()}
              >
                <div className="flex cursor-pointer items-center gap-1.5 rounded-md p-2 hover:bg-muted">
                  <LogOut size={16} className="ml-1.5" />
                  <p className="text-sm">
                    {dictionary.settings_dropdown.logout}
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
