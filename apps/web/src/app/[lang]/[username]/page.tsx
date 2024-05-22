import { redirect } from 'next/navigation'

import { PageProps } from '@/types/languages'
import { Pencil } from 'lucide-react'
import {
  getProfileByUsername,
  getProfileReviews,
} from '@/services/api/profiles'
import { Button } from '@/components/ui/button'
import { ProBadge } from '@/components/pro-badge'

import { ProfileBanner } from './_components/profile-banner'
import { ProfileForm } from './_components/profile-form'
import { ProfileImage } from './_components/profile-image'

import { getDictionary } from '@/utils/dictionaries'
import { ProfileTabs } from './_components/profile-tabs'

export type UserPageProps = PageProps<Record<'username', string>>

const UserPage = async ({ params: { username, lang } }: UserPageProps) => {
  const profile = await getProfileByUsername(username)
  const dictionary = await getDictionary(lang)

  if (!profile) {
    redirect(`/${lang}/home`)
  }

  const reviews = await getProfileReviews({
    userId: profile.id,
    language: lang,
  })

  return (
    <main className="p-0 lg:p-4">
      <div className="mx-auto max-w-6xl">
        <ProfileBanner profile={profile} />

        <div className="mx-auto flex max-w-3xl flex-col space-y-4 p-4  lg:px-16">
          <aside className="-mt-28 flex flex-col space-y-4">
            <div className="space-y-4">
              <ProfileImage profile={profile} />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{profile.username}</h1>

                  {profile.subscription_type === 'PRO' && <ProBadge />}

                  <ProfileForm
                    profile={profile}
                    trigger={
                      <Button
                        size="icon"
                        variant="outline"
                        className="ml-auto h-6 w-6"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>
          </aside>

          <section>
            <ProfileTabs
              dictionary={dictionary}
              lang={lang}
              profile={profile}
              reviews={reviews}
            />
          </section>
        </div>
      </div>
    </main>
  )
}

export default UserPage
