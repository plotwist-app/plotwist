import type { PageProps } from '@/types/languages'
import { MatchesScreen } from '../../_components/matches-screen'

export default async function TogetherMatchesPage(
  props: PageProps<{ code: string }>
) {
  const { code } = await props.params
  return <MatchesScreen code={code} />
}
