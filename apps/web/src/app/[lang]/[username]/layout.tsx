import { getUsersUsername } from '@/api/users'
import { PageProps } from '@/types/languages'
import { redirect } from 'next/navigation'
import { ProfileBanner } from './_components/profile-banner'
import { ProfileImage } from './_components/profile-image'
import { ProBadge } from '@/components/pro-badge'
import { FollowButton } from '@/components/follow-button'
import { Followers } from '@/components/followers'
import { PropsWithChildren } from 'react'
import { ProfileTabs } from './_components/profile-tabs'

export type UserPageProps = PageProps<Record<'username', string>> &
  PropsWithChildren

export default async function Layout({
  params: { username, lang },
  children,
}: UserPageProps) {
  const { user } = await getUsersUsername(username)

  if (!user) {
    redirect(`/${lang}/home`)
  }

  return (
    <main className="p-0 lg:p-4">
      <div className="mx-auto max-w-6xl">
        <ProfileBanner profile={user} />

        <div className="mx-auto flex max-w-4xl flex-col space-y-10 p-4  lg:px-16">
          <aside className="-mt-20 flex flex-col space-y-4 lg:-mt-28">
            <div className="flex gap-4 items-end space-y-4">
              <ProfileImage profile={user} />

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{user.username}</h1>
                    {user.subscriptionType === 'PRO' && <ProBadge />}
                  </div>

                  <FollowButton userId={user.id} />
                </div>

                <Followers />
              </div>
            </div>
          </aside>

          <section className="space-y-4">
            <ProfileTabs user={user} />
            {children}
          </section>
        </div>
      </div>
    </main>
  )
}
