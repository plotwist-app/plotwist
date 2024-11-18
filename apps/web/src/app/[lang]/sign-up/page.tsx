import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { Pattern } from '@/components/pattern'
import { Metadata } from 'next'
import { SignUpForm } from './_components/sign-up-form'
import { AnimatedLink } from '@/components/animated-link'
import { signUp } from '@/actions/auth/sign-up'
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

const SignUpPage = async ({ params: { lang } }: PageProps) => {
  const dictionary = await getDictionary(lang)

  return (
    <>
      <Pattern variant="checkered" />

      <div className="flex h-[calc(100svh-54px-33px)] w-full flex-col items-center justify-center p-4 lg:p-0 relative">
        <div className="space-y- w-full max-w-[450px]">
          <div className="space-y-4">
            <div className="w-full space-y-2 text-center">
              <h1 className="text-3xl font-bold">{dictionary.start_now}</h1>
              <p className="text-sm text-muted-foreground">
                {dictionary.start_your_journey}
              </p>
            </div>

            <SignUpForm onSignUp={signUp} />
          </div>
        </div>

        <div className="fixed bottom-0 w-full border bg-muted p-4 dark:bg-black dark:text-white flex items-center justify-center flex-col space-y-1">
          <p className="text-center text-xs text-muted-foreground">
            {dictionary.already_have_an_account}{' '}
          </p>
          <AnimatedLink
            href={`/${lang}/sign-in`}
            className="text-md font-medium"
          >
            {dictionary.access_now}
          </AnimatedLink>
        </div>
      </div>
    </>
  )
}

export default SignUpPage
