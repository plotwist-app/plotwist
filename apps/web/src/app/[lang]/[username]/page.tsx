import { redirect } from 'next/navigation'
import { PageProps } from '@/types/languages'
import { Pencil } from 'lucide-react'
import { getProfileByUsername } from '@/services/api/profiles'
import { Button } from '@/components/ui/button'
import { ProBadge } from '@/components/pro-badge'
import { Followers } from '@/components/followers'
import { ProfileBanner } from './_components/profile-banner'
import { ProfileForm } from './_components/profile-form'
import { ProfileImage } from './_components/profile-image'
import { ProfileTabs } from './_components/profile-tabs'
import { FollowButton } from '@/components/follow-button'

export const dynamic = 'force-dynamic'

type UserPageProps = PageProps<Record<'username', string>>
const UserPage = async ({ params: { username, lang } }: UserPageProps) => {
  const profile = await getProfileByUsername(username)

  if (!profile) {
    redirect(`/${lang}/home`)
  }

  return (
    <main className="p-0 lg:p-4">
      <div className="mx-auto max-w-6xl">
        <ProfileBanner profile={profile} />

        <div className="mx-auto flex max-w-3xl flex-col space-y-6 p-4  lg:px-16">
          <aside className="-mt-20 flex flex-col space-y-4 lg:-mt-28">
            <div className="space-y-4">
              <ProfileImage profile={profile} />

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{profile.username}</h1>
                    {profile.subscription_type === 'PRO' && <ProBadge />}
                  </div>

                  <ProfileForm
                    profile={profile}
                    trigger={
                      <Button
                        size="icon"
                        variant="outline"
                        className="ml-auto h-8 w-8"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    }
                  />

                  <FollowButton profileId={profile.id} />
                </div>

                <Followers profileId={profile.id} />
              </div>
            </div>
          </aside>

          <section>
            <ProfileTabs profile={profile} />
          </section>
        </div>
      </div>
    </main>
  )
}

export default UserPage
