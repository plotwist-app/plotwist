import Link from 'next/link'
import { LoginForm } from './_components/login-form'
import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { Pattern } from '@/components/pattern'

const LoginPage = async ({ params: { lang } }: PageProps) => {
  const dictionary = await getDictionary(lang)

  return (
    <>
      <Pattern variant="checkered" />

      <div className="flex h-[calc(100vh-70px)] w-full flex-col items-center justify-center p-4 lg:p-0">
        <div className="w-full max-w-[450px] space-y-4">
          <div className="w-full space-y-2">
            <h1 className="text-2xl font-bold">
              {dictionary.login_page.title}
            </h1>

            <p>{dictionary.login_page.description}</p>

            <div className="mt-2 flex space-x-2">
              <div className="rounded-xs w-1 bg-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {dictionary.login_page.no_account}{' '}
                <Link href={`/${lang}/signup`} className="underline">
                  {dictionary.login_page.no_account_link}
                </Link>
                .
              </p>
            </div>
          </div>

          <LoginForm dictionary={dictionary} />
        </div>
      </div>
    </>
  )
}

export default LoginPage
