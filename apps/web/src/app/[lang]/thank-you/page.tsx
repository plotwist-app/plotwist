import { Pattern } from '@/components/pattern'

import { PageProps } from '@/types/languages'

export default async function Home({ params: { lang } }: PageProps) {
  return (
    <>
      <Pattern variant="checkered" />

      <main className="flex h-screen items-center justify-center">
        <p>obrigado.</p>
      </main>
    </>
  )
}
