import Link from 'next/link'
import { SignUpForm } from './components/sign-up-form'

const SignUpPage = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="hidden h-full bg-muted lg:block lg:w-1/2" />

      <div className="flex w-full flex-col items-center justify-center p-4 lg:w-1/2">
        <div className="w-full max-w-[450px] space-y-4">
          <div className="w-full">
            <h1 className="text-2xl font-bold">Create an account</h1>

            <p className="">
              Be part of the cinema community, where you can meet and discuss
              thousands of movies and TV series!
            </p>

            <div className="mt-2 flex space-x-1">
              <div className="rounded-xs w-1 bg-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Already have an account? Access by clicking{' '}
                <Link href="/login" className="underline">
                  here
                </Link>
              </p>
            </div>
          </div>

          <SignUpForm />
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
