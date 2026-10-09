import { TogetherRoom } from '@/components/together-room'
import type { PageProps } from '@/types/languages'

export default async function TogetherRoomPage(
  props: PageProps<{ code: string }>
) {
  const { code } = await props.params
  return <TogetherRoom code={code} />
}
