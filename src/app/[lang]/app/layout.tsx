import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { ListsContextProvider } from '@/context/lists'
import { AuthContextProvider } from '@/context/auth'
import { Sidebar } from '@/components/sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/en-US/login')
  }

  return (
    <AuthContextProvider user={user}>
      <ListsContextProvider>
        <div className="grid grid-cols-[250px,1fr]">
          <Sidebar user={user} />

          <main className="max-h-screen w-full overflow-y-scroll">
            {children}
          </main>
        </div>
      </ListsContextProvider>
    </AuthContextProvider>
  )
}
