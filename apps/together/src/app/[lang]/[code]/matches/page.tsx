import { MatchesScreen } from '@/components/matches-screen'
import type { PageProps } from '@/types/languages'

export default async function TogetherMatchesPage(
  props: PageProps<{ code: string }>
) {
  const { code } = await props.params
  return <MatchesScreen code={code} />
}
