import type { PageProps } from '@/types/languages'
import { TogetherVote } from '../../_components/together-vote'

export default async function TogetherVotePage(
  props: PageProps<{ code: string }>
) {
  const { code } = await props.params
  return <TogetherVote code={code} />
}
