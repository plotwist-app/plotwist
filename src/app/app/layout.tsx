import { Header } from './components/header'
import { Sidebar } from './components/sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[250px,1fr]">
      <Sidebar />

      <main className="w-full">
        <Header />
        {children}
      </main>
    </div>
  )
}
