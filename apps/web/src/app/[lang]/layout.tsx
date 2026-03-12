import { Link } from 'next-view-transitions'
import type { GetUserPreferences200 } from '@/api/endpoints.schemas'
import { getUserPreferences } from '@/api/users'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { HtmlLangSetter } from '@/components/html-lang-setter'
import { ProBadge } from '@/components/pro-badge'
import { SonnerProvider, ThemeProvider } from '@/components/providers'
import { LanguageContextProvider } from '@/context/language'
import { ListsContextProvider } from '@/context/lists'
import { SessionContextProvider } from '@/context/session'
import { UserPreferencesContextProvider } from '@/context/user-preferences'
import type { Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { SUPPORTED_LANGUAGES } from '../../../languages'
import { verifySession } from '../lib/dal'

export async function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map(lang => ({ lang: lang.value }))
}

// Note: This layout is automatically dynamic due to cookies() usage in verifySession()
// Removed explicit 'force-dynamic' to allow child pages to use ISR/static when possible

type RootLayoutProps = {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function RootLayout({
  params,
  children,
}: RootLayoutProps) {
  const { lang: langParam } = await params
  const lang = langParam as Language

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
      <HtmlLangSetter lang={lang} />
      <SonnerProvider>
        <SessionContextProvider initialSession={session}>
          <LanguageContextProvider language={lang} dictionary={dictionary}>
            <UserPreferencesContextProvider userPreferences={userPreferences}>
              <ListsContextProvider>
                <div className="flex flex-col">
                  <div className="sticky top-0 z-50 w-full lg:relative lg:top-auto">
                    <div className="mx-auto w-full max-w-6xl bg-background/80 backdrop-blur-xl border-b border-foreground/[0.06] px-4 py-2.5 lg:mt-4 lg:mb-2 lg:rounded-2xl lg:border lg:ring-1 lg:ring-foreground/[0.06] lg:border-transparent lg:shadow-sm lg:shadow-black/[0.03]">
                      <Header />
                    </div>
                  </div>

                  <main className="w-full min-h-screen">{children}</main>

                  <Footer dictionary={dictionary} language={lang} />
                </div>

                {session?.user.subscriptionType !== 'PRO' && (
                  <Link
                    href={`/${lang}/pricing`}
                    className="fixed bottom-4 right-4 bg-foreground text-background rounded-full py-2 px-4 shadow-lg hover:bg-foreground/90 transition-colors"
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
