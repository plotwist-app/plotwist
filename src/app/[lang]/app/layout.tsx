import { redirect } from 'next/navigation'

import { ListsContextProvider } from '@/context/lists'
import { AuthContextProvider } from '@/context/auth'
import { Sidebar } from '@/components/sidebar'
import { PageProps } from '@/types/languages'
import { getUserService } from '@/services/api/users/get-user'

type AppLayoutProps = {
  children: React.ReactNode
} & PageProps

export default async function AppLayout({ children, params }: AppLayoutProps) {
  const {
    data: { user },
  } = await getUserService()

  if (!user) {
    redirect(`/${params.lang}/login`)
  }

  return (
    <AuthContextProvider user={user}>
      <ListsContextProvider>
        <div className="grid-col-1 grid lg:grid-cols-[250px,1fr]">
          <Sidebar user={user} />

          <main className="max-h-screen w-full overflow-y-scroll">
            {children}
          </main>
        </div>
      </ListsContextProvider>
    </AuthContextProvider>
  )
}
