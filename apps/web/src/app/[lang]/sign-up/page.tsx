import Link from 'next/link'
import { SignUpForm } from './_components/sign-up-form'
import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { Pattern } from '@/components/pattern'
import { Metadata } from 'next'

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    sign_up_page: { title },
  } = await getDictionary(params.lang)

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

const SignUpPage = async ({ params: { lang } }: PageProps) => {
  const dictionary = await getDictionary(lang)

  return (
    <>
      <Pattern variant="checkered" />

      <div className="bg flex h-[calc(100vh-70px)] w-full flex-col items-center justify-center p-4 lg:p-0">
        <div className="w-full max-w-[450px] space-y-4">
          <div className="w-full space-y-2">
            <h1 className="text-3xl font-bold">
              {dictionary.sign_up_page.title}
            </h1>

            <div className="mt-2 flex space-x-2">
              <div className="w-1 rounded-lg bg-muted" />

              <p className="text-sm text-muted-foreground">
                {dictionary.sign_up_page.already_have_account}{' '}
                <Link href="/login" className="underline">
                  {dictionary.here}
                </Link>
              </p>
            </div>
          </div>

          <SignUpForm dictionary={dictionary} />
        </div>
      </div>
    </>
  )
}

export default SignUpPage
