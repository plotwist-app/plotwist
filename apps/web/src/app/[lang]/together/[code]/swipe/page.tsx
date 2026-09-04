import { redirect } from 'next/navigation'
import type { PageProps } from '@/types/languages'

export default async function TogetherSwipeRedirect(
  props: PageProps<{ code: string }>
) {
  const { lang, code } = await props.params
  redirect(`/${lang}/together/${code}/vote`)
}
