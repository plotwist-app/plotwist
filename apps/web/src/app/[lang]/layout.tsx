import { LanguageContextProvider } from '@/context/language'
import type { Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'

import { ListsContextProvider } from '@/context/lists'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'

import { SUPPORTED_LANGUAGES } from '../../../languages'
import { SonnerProvider, ThemeProvider } from '@/components/providers'
import { verifySession } from '../lib/dal'
import { SessionContextProvider } from '@/context/session'
import { getUserPreferences } from '@/api/users'
import type { GetUserPreferences200 } from '@/api/endpoints.schemas'
import { UserPreferencesContextProvider } from '@/context/user-preferences'
import { ProBadge } from '@/components/pro-badge'

import { Link } from 'next-view-transitions'

export async function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map(lang => ({ lang: lang.value }))
}

export const dynamic = 'force-dynamic'

type RootLayoutProps = {
  children: React.ReactNode
  params: Promise<{ lang: Language }>
}

export default async function RootLayout({
  params,
  children,
}: RootLayoutProps) {
  const { lang } = await params

  const dictionary = await getDictionary(lang)
  const session = await verifySession()

  let userPreferences: GetUserPreferences200['userPreferences'] = null

  if (session) {
    const { userPreferences: userPreferencesData } = await getUserPreferences()
    userPreferences = userPreferencesData
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SonnerProvider>
        <SessionContextProvider initialSession={session}>
          <LanguageContextProvider language={lang} dictionary={dictionary}>
            <UserPreferencesContextProvider userPreferences={userPreferences}>
              <ListsContextProvider>
                <div className="flex flex-col">
                  <div className="mx-auto w-full max-w-6xl border-b bg-background px-4 py-2 lg:my-4 lg:rounded-full lg:border">
                    <Header />
                  </div>

                  <main className="w-full min-h-screen">{children}</main>

                  <Footer dictionary={dictionary} language={lang} />
                </div>

                {session?.user.subscriptionType !== 'PRO' && (
                  <Link
                    href={`/${lang}/pricing`}
                    className="fixed bottom-4 right-4 border bg-background rounded-full py-2 px-4"
                  >
                    <span className="flex gap-2 items-center text-center text-sm">
                      {dictionary.get_14_days_free_pro} <ProBadge />
                    </span>
                  </Link>
                )}
              </ListsContextProvider>
            </UserPreferencesContextProvider>
          </LanguageContextProvider>
        </SessionContextProvider>
      </SonnerProvider>
    </ThemeProvider>
  )
}
