import { Inter } from 'next/font/google'
import { redirect } from 'next/navigation'
import { verifySession } from '@/app/lib/dal'
import { AdminSidebar } from './_components/admin-sidebar'

const inter = Inter({ subsets: ['latin'] })

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const session = await verifySession()

  if (!session) {
    redirect(`/${lang}/sign-in`)
  }

  if (session.user?.email !== 'dev@plotwist.app') {
    redirect(`/${lang}`)
  }

  return (
    <>
      <style>{`
        body { overflow: hidden; }
        .admin-panel {
          --gray-1: #fcfcfc;
          --gray-2: #f9f9f9;
          --gray-3: #f0f0f0;
          --gray-4: #e8e8e8;
          --gray-5: #e0e0e0;
          --gray-6: #d9d9d9;
          --gray-7: #cecece;
          --gray-8: #bbbbbb;
          --gray-9: #8d8d8d;
          --gray-10: #838383;
          --gray-11: #646464;
          --gray-12: #202020;
        }
        .dark .admin-panel {
          --gray-1: #111111;
          --gray-2: #191919;
          --gray-3: #222222;
          --gray-4: #2a2a2a;
          --gray-5: #313131;
          --gray-6: #3a3a3a;
          --gray-7: #484848;
          --gray-8: #606060;
          --gray-9: #6e6e6e;
          --gray-10: #7b7b7b;
          --gray-11: #b4b4b4;
          --gray-12: #eeeeee;
        }
      `}</style>
      <div
        className={`admin-panel fixed inset-0 z-50 flex bg-[var(--gray-2)] ${inter.className}`}
      >
        <AdminSidebar />
        <main className="m-2 flex flex-1 flex-col overflow-hidden rounded-xl border border-[var(--gray-4)] bg-[var(--gray-1)]">
          {children}
        </main>
      </div>
    </>
  )
}
