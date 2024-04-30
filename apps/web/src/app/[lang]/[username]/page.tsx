import { redirect } from 'next/navigation'

import { PageProps } from '@/types/languages'
import { Lock, Pencil } from 'lucide-react'
import { getProfileByUsername } from '@/services/api/profiles'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

import { ProfileReviews } from './_components/profile-reviews'
import { ProfileLists } from './_components/profile-lists'
import { ProfileBanner } from './_components/profile-banner'
import { ProfileForm } from './_components/profile-form'
import { ProfileImage } from './_components/profile-image'
import { ProBadge } from '@/components/pro-badge'

import { getDictionary } from '@/utils/dictionaries'
import { ProfileAchievements } from './_components/profile-achievements'

type UserPageProps = PageProps<Record<'username', string>>

const UserPage = async ({ params: { username, lang } }: UserPageProps) => {
  const profile = await getProfileByUsername(username)
  const dictionary = await getDictionary(lang)

  if (!profile) {
    redirect(`/${lang}/home`)
  }

  const isUserPro = profile.subscription_type === 'PRO'

  return (
    <main className="p-0 lg:p-4">
      <div className="mx-auto max-w-6xl">
        <ProfileBanner
          profileId={profile.id}
          profileUsername={profile.username}
        />

        <div className="grid grid-cols-1 gap-0 space-y-8 p-4 lg:grid-cols-3 lg:gap-16 lg:px-16">
          <aside className="col-span-1 -mt-20 flex flex-col space-y-4">
            <div className="space-y-4">
              <ProfileImage profile={profile} />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{profile.username}</h1>

                  {isUserPro && <ProBadge />}

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

            <ProfileAchievements dictionary={dictionary} />
          </aside>

          <section className="col-span-2">
            <Tabs defaultValue="reviews" className="w-full">
              <div className="md:m-none p-none -mx-4 max-w-[100vw] overflow-x-scroll px-4 scrollbar-hide">
                <TabsList>
                  <TabsTrigger value="reviews">
                    {dictionary.profile.reviews}
                  </TabsTrigger>

                  <TabsTrigger value="lists">
                    {dictionary.profile.lists}
                  </TabsTrigger>

                  <TabsTrigger value="communities" disabled>
                    {dictionary.profile.communities}
                    <Lock className="ml-1" size={12} />
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="reviews" className="mt-4">
                <ProfileReviews userId={profile.id} language={lang} />
              </TabsContent>

              <TabsContent value="lists" className="mt-4">
                <ProfileLists userId={profile.id} />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </main>
  )
}

export default UserPage
