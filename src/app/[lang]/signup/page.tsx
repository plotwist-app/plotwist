import Link from 'next/link'
import { SignUpForm } from './_components/sign-up-form'
import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'

const SignUpPage = async ({ params: { lang } }: PageProps) => {
  const dictionary = await getDictionary(lang)

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="hidden h-full bg-muted lg:block lg:w-1/2" />

      <div className="flex w-full flex-col items-center justify-center p-4 lg:w-1/2">
        <div className="w-full max-w-[450px] space-y-4">
          <div className="w-full space-y-2">
            <h1 className="text-2xl font-bold">
              {dictionary.sign_up_page.title}
            </h1>
            <p className="">{dictionary.sign_up_page.description}</p>

            <div className="mt-2 flex space-x-1">
              <div className="rounded-xs w-1 bg-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {dictionary.sign_up_page.already_have_account}{' '}
                <Link href="/login" className="underline">
                  {dictionary.sign_up_page.here_link}
                </Link>
              </p>
            </div>
          </div>

          <SignUpForm dictionary={dictionary} />
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
