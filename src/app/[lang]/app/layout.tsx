import { Header } from '@/components/header'
import { PageProps } from '@/types/languages'

type AppLayoutProps = {
  children: React.ReactNode
} & PageProps

export default async function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col space-y-8">
      <div className="w-full border-b p-4">
        <div className="mx-auto w-full max-w-6xl">
          <Header />
        </div>
      </div>

      <main className="w-full">{children}</main>
    </div>
  )
}
