import { signIn } from '@/actions/auth/sign-in'
import { Pattern } from '@/components/pattern'
import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { Link } from 'next-view-transitions'
import { SignInForm } from './_sign-in-form'

export default async function SignInPage(props: PageProps) {
  const params = await props.params

  const { lang } = params

  const dictionary = await getDictionary(lang)

  return (
    <>
      <Pattern variant="checkered" />

      <div className="flex h-[calc(90svh)] w-full flex-col items-center justify-center p-4 lg:p-0 relative">
        <div className="space-y-4 w-full max-w-[450px]">
          <div className="space-y-4">
            <h1 className="text-center text-3xl font-bold">
              {dictionary.access_plotwist}
            </h1>

            <SignInForm onSignIn={signIn} />

            <div className="flex justify-center">
              <Link
                href={`/${lang}/sign-up`}
                className="text-center text-xs text-muted-foreground hover:underline"
              >
                {dictionary.do_not_have_an_account} {dictionary.create_now}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
