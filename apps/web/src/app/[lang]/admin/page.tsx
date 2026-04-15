import { redirect } from 'next/navigation'

export default async function AdminPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  redirect(`/${lang}/admin/achievements`)
}
