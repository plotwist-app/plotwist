import { LanguageContextProvider } from '@/context/language'
import type { Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { Toaster } from '@plotwist/ui/components/ui/sonner'

import { AppWrapper } from '@/context/app'
import { ListsContextProvider } from '@/context/lists'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

import { SUPPORTED_LANGUAGES } from '../../../languages'
import { verifySession } from '../lib/dal'
import { SessionContextProvider } from '@/context/session/session'

export async function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang: lang.value }))
}

export const dynamic = 'force-dynamic'

type RootLayoutProps = {
  children: React.ReactNode
  params: { lang: Language }
}

export default async function RootLayout({
  children,
  params: { lang },
}: RootLayoutProps) {
  const dictionary = await getDictionary(lang)
  const session = await verifySession()

  return (
    <AppWrapper>
      <LanguageContextProvider language={lang} dictionary={dictionary}>
        <SessionContextProvider initialSession={session}>
          <ListsContextProvider>
            <div className="flex flex-col">
              <div className="mx-auto w-full max-w-6xl border-b bg-background px-4 py-2 lg:my-4 lg:rounded-full lg:border">
                <Header />
              </div>

              <main className="w-full">{children}</main>
              <Footer dictionary={dictionary} language={lang} />
            </div>
          </ListsContextProvider>
          <Toaster />
        </SessionContextProvider>
      </LanguageContextProvider>
    </AppWrapper>
  )
}
