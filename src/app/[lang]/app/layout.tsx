import { Header } from '@/components/header'
import { PageProps } from '@/types/languages'

type AppLayoutProps = {
  children: React.ReactNode
} & PageProps

export default async function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col space-y-8 p-4">
      <div className="mx-auto w-full max-w-5xl">
        <Header />
      </div>

      <main className="w-full">{children}</main>
    </div>
  )
}
