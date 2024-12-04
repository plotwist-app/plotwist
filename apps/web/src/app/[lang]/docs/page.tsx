'use client'

import type { PageProps } from '@/types/languages'
import { notFound } from 'next/navigation'

export default async function Page(props: PageProps) {
  const params = await props.params
  try {
    const Content = (await import(`./_content/${params.lang}.mdx`)).default
    return <Content />
  } catch (error) {
    notFound()
  }
}
