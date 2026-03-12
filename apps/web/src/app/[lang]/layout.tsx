import { Link } from 'next-view-transitions'
import type { GetUserPreferences200 } from '@/api/endpoints.schemas'
import { getUserPreferences } from '@/api/users'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { HtmlLangSetter } from '@/components/html-lang-setter'
import { LayoutWrapper } from '@/components/layout-wrapper'
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
    const { data } = await getUserPreferences()
    userPreferences = data?.userPreferences ?? null
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
                <LayoutWrapper
                  header={<Header />}
                  footer={<Footer dictionary={dictionary} language={lang} />}
                  proBadge={
                    session?.user.subscriptionType !== 'PRO' ? (
                      <Link
                        href={`/${lang}/pricing`}
                        className="fixed bottom-4 right-4 border bg-background rounded-full py-2 px-4 z-50"
                      >
                        <span className="flex gap-2 items-center text-center text-sm">
                          {dictionary.get_14_days_free_pro} <ProBadge />
                        </span>
                      </Link>
                    ) : null
                  }
                >
                  {children}
                </LayoutWrapper>
              </ListsContextProvider>
            </UserPreferencesContextProvider>
          </LanguageContextProvider>
        </SessionContextProvider>
      </SonnerProvider>
    </ThemeProvider>
  )
}
