import { redirect } from 'next/navigation'
import { StarFilledIcon } from '@radix-ui/react-icons'

import { PageProps } from '@/types/languages'
import { List, Pencil, Trophy, Users } from 'lucide-react'
import { getProfileByUsername } from '@/services/api/profiles'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ProBadge } from '@/components/pro-badge'

import { ProfileReviews } from './_components/profile-reviews'
import { ProfileLists } from './_components/profile-lists'
import { ProfileBanner } from './_components/profile-banner'
import { ProfileForm } from './_components/profile-form'
import { ProfileImage } from './_components/profile-image'
import { ProfileAchievements } from './_components/profile-achievements'

import { getDictionary } from '@/utils/dictionaries'

type UserPageProps = PageProps<Record<'username', string>>

const UserPage = async ({ params: { username, lang } }: UserPageProps) => {
  const profile = await getProfileByUsername(username)
  const dictionary = await getDictionary(lang)

  if (!profile) {
    redirect(`/${lang}/home`)
  }

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
            <Tabs defaultValue="reviews" className="w-full">
              <div className="md:m-none p-none -mx-4 max-w-[100vw] overflow-x-scroll px-4 scrollbar-hide">
                <TabsList>
                  <TabsTrigger value="reviews">
                    <StarFilledIcon className="mr-1" width={12} height={12} />
                    {dictionary.profile.reviews}
                  </TabsTrigger>

                  <TabsTrigger value="lists">
                    <List className="mr-1" width={12} height={12} />
                    {dictionary.profile.lists}
                  </TabsTrigger>

                  <TabsTrigger value="achievements">
                    <Trophy className="mr-1" width={12} height={12} />
                    {dictionary.profile.achievements}
                  </TabsTrigger>

                  <TabsTrigger value="communities" disabled>
                    <Users className="mr-1" width={12} height={12} />

                    {dictionary.profile.communities}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="reviews" className="mt-4">
                <ProfileReviews userId={profile.id} language={lang} />
              </TabsContent>

              <TabsContent value="lists" className="mt-4">
                <ProfileLists userId={profile.id} />
              </TabsContent>

              <TabsContent value="achievements" className="mt-4">
                <ProfileAchievements dictionary={dictionary} />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </main>
  )
}

export default UserPage
