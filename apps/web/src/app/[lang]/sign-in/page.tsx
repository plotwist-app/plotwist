import { PageProps } from '@/types/languages'
import { SignIn } from './_sign-in'
import { getDictionary } from '@/utils/dictionaries'
import { Pattern } from '@/components/pattern'
import Link from 'next/link'

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

            <SignIn />
          </div>
        </div>

        <div className="absolute bottom-0 w-full border-t bg-muted dark:bg-black p-4 items-center justify-center space-x-1 flex">
          <Link
            href={`/${lang}/sign-up`}
            className="text-center text-xs text-muted-foreground hover:underline"
          >
            {dictionary.do_not_have_an_account} {dictionary.create_now}
          </Link>
        </div>
      </div>
    </>
  )
}
