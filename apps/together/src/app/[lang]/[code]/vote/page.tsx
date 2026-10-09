import { TogetherVote } from '@/components/together-vote'
import type { PageProps } from '@/types/languages'

export default async function TogetherVotePage(
  props: PageProps<{ code: string }>
) {
  const { code } = await props.params
  return <TogetherVote code={code} />
}
