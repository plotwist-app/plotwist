import { getUsersUsername } from '@/api/users'
import { PageProps } from '@/types/languages'
import { redirect } from 'next/navigation'
import { ProfileBanner } from './_components/profile-banner'
import { ProfileImage } from './_components/profile-image'
import { ProBadge } from '@/components/pro-badge'
import { PropsWithChildren } from 'react'
import { ProfileTabs } from './_components/profile-tabs'
import { Button } from '@plotwist/ui/components/ui/button'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { locale } from '@/utils/date/locale'
import { getDictionary } from '@/utils/dictionaries'
import { SocialLinks } from './_components/social-links'
import { UserDialog } from './_components/user-dialog'
import { getSocialLinksByUserId } from '@/api/social-links'

export type UserPageProps = PageProps<Record<'username', string>> &
  PropsWithChildren

export default async function Layout({
  params: { username, lang },
  children,
}: UserPageProps) {
  const { user } = await getUsersUsername(username)
  const dictionary = await getDictionary(lang)

  if (!user) {
    redirect(`/${lang}/home`)
  }

  const { socialLinks } = await getSocialLinksByUserId(user.id)

  return (
    <main className="p-0 lg:p-4 mx-auto max-w-6xl">
      <ProfileBanner profile={user} />

      <section
        className={cn(
          'mx-auto max-w-5xl px-4',
          'flex flex-col',
          'lg:grid lg:grid-cols-3 lg:px-0 lg:gap-8',
        )}
      >
        <aside className="flex flex-col space-y-4 col-span-1 relative">
          <div
            className={cn(
              'flex flex-col items-center gap-8 text-center justify-center sticky top-4',
              'lg:justify-start lg:flex-col lg:text-start lg:items-start',
            )}
          >
            <ProfileImage profile={user} />

            <div
              className={cn(
                'flex flex-col items-center justify-center gap-2 w-full',
                'lg:block lg:flex-row',
              )}
            >
              <p className="text-xs text-muted-foreground">
                {dictionary.member_since}{' '}
                {format(new Date(user.createdAt), 'MMM/yyyy', {
                  locale: locale[lang],
                })}
              </p>

              <div className="flex items-center gap-4 mt-2">
                <h1 className="text-3xl font-bold">{user.username}</h1>

                <UserDialog user={user} socialLinks={socialLinks}>
                  <Button size="sm" variant="outline">
                    {dictionary.profile_form.dialog_title}
                  </Button>
                </UserDialog>
              </div>

              <p className="text-muted-foreground mt-2 text-sm">
                {user.biography}
              </p>

              <div
                className={cn(
                  'flex gap-1 flex-wrap mt-4 justify-center',
                  'sm:justify-start',
                )}
              >
                {user.subscriptionType === 'PRO' && <ProBadge />}

                {/* <Badge variant="outline">375 movies</Badge> */}
                {/* <Badge variant="outline">375 series</Badge> */}

                {/* <Badge variant="outline">Potterhead</Badge>
                <Badge variant="outline">Marveleiro</Badge>
                <Badge variant="outline">Jedi</Badge>
                <Badge variant="outline">Tolkienista</Badge>
                <Badge variant="outline">Afiliado</Badge> */}
              </div>

              <SocialLinks socialLinks={socialLinks} />

              {/* <FollowButton userId={user.id} /> */}
              {/* <Followers /> */}
            </div>
          </div>
        </aside>

        <section className="space-y-4 col-span-2 mt-8">
          <ProfileTabs user={user} />
          {children}
        </section>
      </section>
    </main>
  )
}
