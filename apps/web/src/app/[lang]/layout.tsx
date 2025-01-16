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

  let userPreferences: GetUserPreferences200 | undefined = undefined

  if (session) {
    userPreferences = await getUserPreferences()
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
            <UserPreferencesContextProvider
              userPreferences={userPreferences?.userPreferences}
            >
              <ListsContextProvider>
                <div className="flex flex-col">
                  <div className="mx-auto w-full max-w-6xl border-b bg-background px-4 py-2 lg:my-4 lg:rounded-full lg:border">
                    <Header />
                  </div>

                  <main className="w-full min-h-screen">{children}</main>

                  <Footer dictionary={dictionary} language={lang} />
                </div>
              </ListsContextProvider>
            </UserPreferencesContextProvider>
          </LanguageContextProvider>
        </SessionContextProvider>
      </SonnerProvider>
    </ThemeProvider>
  )
}
