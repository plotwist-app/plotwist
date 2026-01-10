'use client'

import { notFound } from 'next/navigation'
import type { PageProps } from '@/types/languages'

export default async function Page(props: PageProps) {
  const params = await props.params
  try {
    const Content = (await import(`./_content/${params.lang}.mdx`)).default
    return <Content />
  } catch (error) {
    notFound()
  }
}
