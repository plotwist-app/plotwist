import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { Pattern } from '@/components/pattern'
import { Metadata } from 'next'
import { SignUpSocial } from './_components/sign-up-social'

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

const SignUpPage = async () => {
  return (
    <>
      <Pattern variant="checkered" />

      <div className="bg flex h-[calc(100vh-70px)] w-full flex-col items-center justify-center p-4 lg:p-0">
        <div className="space-y- w-full max-w-[450px]">
          <div className="space-y-4">
            <div className="w-full space-y-2 text-center">
              <h1 className="text-3xl font-bold">Comece agora!</h1>

              <p className="text-sm text-muted-foreground">
                Bem-vindo ao Plotwist. Comece sua jornada com apenas poucos
                passos.
              </p>
            </div>

            <SignUpSocial />
          </div>

          {/* <div className="space-y-8">
            <SignUpForm dictionary={dictionary} />

            <p className="text-center text-sm text-muted-foreground">
              {dictionary.sign_up_page.already_have_account}{' '}
              <Link href="/login" className="underline">
                {dictionary.here}
              </Link>
            </p>
          </div> */}
        </div>
      </div>
    </>
  )
}

export default SignUpPage
