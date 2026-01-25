import type { Metadata } from 'next'
import { Link } from 'next-view-transitions'
import { signUp } from '@/actions/auth/sign-up'
import { Pattern } from '@/components/pattern'
import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { SignUpForm } from './_components/sign-up-form'

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
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

const SignUpPage = async (props: PageProps) => {
  const { lang } = await props.params
  const dictionary = await getDictionary(lang)

  return (
    <>
      <Pattern variant="checkered" />

      <div className="flex h-[calc(90svh)] w-full flex-col items-center justify-center p-4 lg:p-0 relative">
        <div className="space-y-4 w-full max-w-[450px]">
          <div className="space-y-4">
            <div className="w-full space-y-2 text-center">
              <h1 className="text-3xl font-bold">{dictionary.start_now}</h1>
              <p className="text-sm text-muted-foreground">
                {dictionary.start_your_journey}
              </p>
            </div>

            <SignUpForm onSignUp={signUp} />

            <div className="flex justify-center">
              <Link
                href={`/${lang}/sign-in`}
                className="text-center text-xs text-muted-foreground hover:underline"
              >
                {dictionary.already_have_an_account} {dictionary.access_now}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignUpPage
