import { Link } from 'next-view-transitions'
import { signIn } from '@/actions/auth/sign-in'
import { Pattern } from '@/components/pattern'
import { asLanguage, type PageProps } from '@/types/languages'
import { getSafeLocalizedRedirectPath } from '@/utils/auth-redirect'
import { getDictionary } from '@/utils/dictionaries'
import { SignInForm } from './_sign-in-form'

type SignInPageProps = PageProps & {
  searchParams?: Promise<{ redirect?: string | string[] }>
}

export default async function SignInPage(props: SignInPageProps) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ])
  const lang = asLanguage(params.lang)
  const redirectTo =
    getSafeLocalizedRedirectPath(searchParams?.redirect, lang) ??
    `/${lang}/home`

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

            <SignInForm onSignIn={signIn} redirectTo={redirectTo} />

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
