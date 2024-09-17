import Link from 'next/link'
import { LoginForm } from './_components/login-form'
import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { Pattern } from '@/components/pattern'
import { Metadata } from 'next'
import { LoginSocial } from './_components/login-social'

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const dictionary = await getDictionary(params.lang)
  const title = dictionary.access_plotwist

  return {
    title,
    openGraph: {
      title,
      siteName: 'Plotwist',
    },
    twitter: {
      title,
    },
  }
}

const LoginPage = async ({ params: { lang } }: PageProps) => {
  const dictionary = await getDictionary(lang)

  return (
    <>
      <Pattern variant="checkered" />

      <div className="flex h-[calc(100svh-72px-54px)] w-full flex-col items-center justify-center p-4 lg:p-0">
        <div className="space-y- w-full max-w-[450px]">
          <div className="space-y-4">
            <h1 className="text-center text-3xl font-bold">
              {dictionary.access_plotwist}
            </h1>

            <LoginSocial />
            <LoginForm />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 w-full border bg-muted p-4 dark:bg-black dark:text-white">
        <p className="text-center text-sm">
          {dictionary.do_not_have_an_account}{' '}
          <Link href={`/${lang}/sign-up`} className="underline">
            {dictionary.create_now}
          </Link>
        </p>
      </div>
    </>
  )
}

export default LoginPage
