import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { Pattern } from '@/components/pattern'
import { Metadata } from 'next'
import { SignUpSocial } from './_components/sign-up-social'
import { SignUpForm } from './_components/sign-up-form'
import Link from 'next/link'

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const dictionary = await getDictionary(params.lang)
  const title = dictionary.start_now

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

const SignUpPage = async ({ searchParams, params: { lang } }: PageProps) => {
  const dictionary = await getDictionary(lang)

  return (
    <>
      <Pattern variant="checkered" />

      <div className="flex h-[calc(100svh-72px-54px)] w-full flex-col items-center justify-center p-4 lg:p-0">
        <div className="space-y- w-full max-w-[450px]">
          <div className="space-y-4">
            <div className="w-full space-y-2 text-center">
              <h1 className="text-3xl font-bold">{dictionary.start_now}</h1>
              <p className="text-sm text-muted-foreground">
                {dictionary.start_your_journey}
              </p>
            </div>

            {searchParams.provider ? <SignUpForm /> : <SignUpSocial />}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 w-full border bg-muted p-4 dark:bg-black dark:text-white">
        <p className="text-center text-sm">
          {dictionary.already_have_an_account}{' '}
          <Link href="/login" className="underline">
            {dictionary.access_now}
          </Link>
        </p>
      </div>
    </>
  )
}

export default SignUpPage
