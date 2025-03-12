import type { PageProps } from '@/types/languages'
import { ListPageComponent } from './list-page'

type ListPageProps = PageProps<{ slug: string }>

export default async function Page(props: ListPageProps) {
  const { slug } = await props.params

  return <ListPageComponent slug={slug} />
}
