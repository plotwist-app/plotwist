import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { Pattern } from '@/components/pattern'
import { SignInForm } from './_sign-in-form'
import { signIn } from '@/actions/auth/sign-in'
import { AnimatedLink } from '@/components/animated-link'

export default async function SignInPage({ params: { lang } }: PageProps) {
  const dictionary = await getDictionary(lang)

  return (
    <>
      <Pattern variant="checkered" />

      <div className="flex h-[calc(100svh-54px-33px)] w-full flex-col items-center justify-center p-4 lg:p-0 relative">
        <div className="space-y- w-full max-w-[450px]">
          <div className="space-y-4">
            <h1 className="text-center text-3xl font-bold">
              {dictionary.access_plotwist}
            </h1>

            <SignInForm onSignIn={signIn} />
          </div>
        </div>

        <div className="fixed bottom-0 w-full border bg-muted p-4 dark:bg-black dark:text-white flex items-center justify-center flex-col space-y-1">
          <p className="text-center text-xs text-muted-foreground">
            {dictionary.do_not_have_an_account}{' '}
          </p>
          <AnimatedLink
            href={`/${lang}/sign-up`}
            className="text-md font-medium"
          >
            {dictionary.create_account}
          </AnimatedLink>
        </div>
      </div>
    </>
  )
}
