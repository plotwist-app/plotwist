import { PageProps } from '@/types/languages'
import { ProBadge } from '@/components/pro-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lock, LucideIcon, Pencil } from 'lucide-react'
import { getProfileByUsername } from '@/services/api/profiles'
import { ProfileReviews } from './_components/profile-reviews'
import { ProfileLists } from './_components/profile-lists'
import { ProfileBanner } from './_components/profile-banner'

import * as icons from 'lucide-react'
import { redirect } from 'next/navigation'
import { getDictionary } from '@/utils/dictionaries'
import { Button } from '@/components/ui/button'
import { ProfileForm } from './_components/profile-form'

const RandomIcon = () => {
  const iconNames = Object.keys(icons)
  const randomIconName = iconNames[Math.floor(Math.random() * iconNames.length)]
  const IconComponent = icons[
    randomIconName as keyof typeof icons
  ] as LucideIcon

  return <IconComponent size={16} />
}

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
              <div className="relative z-50 flex aspect-square w-32 items-center justify-center rounded-full border bg-muted text-2xl">
                {profile.username[0].toUpperCase()}
              </div>

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

              <div className="relative space-y-2 rounded-lg border p-4">
                <div className="absolute right-0 top-0 flex h-full w-full items-center justify-center rounded-lg border border-dashed bg-black/10 backdrop-blur-[1.5px] dark:bg-black/50">
                  🚧 {dictionary.profile.work_in_progress}
                </div>

                <h3 className="font-semibold">
                  {dictionary.profile.achievements}
                </h3>

                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 15 }).map((_, index) => {
                    return (
                      <div
                        className="flex aspect-square items-center justify-center rounded-lg bg-muted"
                        key={index}
                      >
                        <RandomIcon />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
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
