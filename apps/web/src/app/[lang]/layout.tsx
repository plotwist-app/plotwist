import { Toaster } from '@/components/ui/sonner'

import { LanguageContextProvider } from '@/context/language'
import { Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'

import { AppWrapper } from '@/context/app'

import { AuthContextProvider } from '@/context/auth'
import { ListsContextProvider } from '@/context/lists'
import { getUserService } from '@/services/api/users/get-user'
import { Header } from '@/components/header'
import { SUPPORTED_LANGUAGES } from '../../../languages'

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
  params,
}: RootLayoutProps) {
  const dictionary = await getDictionary(params.lang)
  const user = await getUserService()

  return (
    <AppWrapper>
      <LanguageContextProvider language={params.lang} dictionary={dictionary}>
        <AuthContextProvider initialUser={user}>
          <ListsContextProvider>
            <div className="flex flex-col">
              <div className="w-full border-b bg-background p-4">
                <div className="mx-auto w-full max-w-6xl">
                  <Header />
                </div>
              </div>

              <main className="w-full">{children}</main>
            </div>
          </ListsContextProvider>
          <Toaster />
        </AuthContextProvider>
      </LanguageContextProvider>
    </AppWrapper>
  )
}
