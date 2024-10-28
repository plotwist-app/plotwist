import { PageProps } from '@/types/languages'
import { notFound } from 'next/navigation'

export default async function Page({ params }: PageProps) {
  try {
    const Content = (await import(`./_content/${params.lang}.mdx`)).default

    return <Content />
  } catch (error) {
    console.log({ error })
    notFound()
  }
}
