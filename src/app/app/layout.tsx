import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Header } from './components/header'
import { Sidebar } from './components/sidebar'

export const dynamic = 'force-dynamic'

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
    redirect('/login')
  }

  return (
    <div className="grid grid-cols-[250px,1fr]">
      <Sidebar user={user} />

      <main className="max-h-screen w-full overflow-y-scroll">
        <Header />
        {children}
      </main>
    </div>
  )
}
