'use client'

import { useGetUserById } from '@/api/users'
import { ProBadge } from '@/components/pro-badge'
import { useLanguage } from '@/context/language'
import type { List } from '@/types/supabase/lists'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import Link from 'next/link'

type UserResumeProps = {
  list: List
}

export const UserResume = ({ list }: UserResumeProps) => {
  const { language } = useLanguage()
  const { data, isLoading } = useGetUserById(list.userId)

  if (isLoading || !data) {
    return <UserResumeSkeleton />
  }

  const { user } = data

  const username = user.username
  const profileHref = `/${language}/${username}`

  return (
    <div className="flex gap-2 items-center">
      <Link href={profileHref}>
        <Avatar className="size-10 border">
          {user.avatarUrl && (
            <AvatarImage src={user.avatarUrl} className="object-cover" />
          )}

          <AvatarFallback className="uppercase">
            {username?.at(0)}
          </AvatarFallback>
        </Avatar>
      </Link>

      <Link href={profileHref}>{username}</Link>

      {user.subscriptionType === 'PRO' && <ProBadge />}
    </div>
  )
}

export const UserResumeSkeleton = () => {
  const { dictionary } = useLanguage()

  return (
    <div className="flex gap-2 items-center">
      <Skeleton className="size-10 border rounded-full" />
      <Skeleton className="w-[10ch] h-[2ex]" />
    </div>
  )
}
