import Link from 'next/link'
import { LoginForm } from './components/login-form'

const LoginPage = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="hidden h-full bg-muted lg:block lg:w-1/2" />

      <div className="flex w-full flex-col items-center justify-center lg:w-1/2">
        <div className="w-full max-w-[350px] space-y-4">
          <div className="w-full">
            <h1 className="text-2xl font-bold">Login</h1>

            <p className="">
              Be part of cinema community, meet and discuss thousands of movies
              and TV series!
            </p>

            <div className="mt-2 flex space-x-1">
              <div className="rounded-xs w-1 bg-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account? Register by clicking{' '}
                <Link href="/register" className="underline">
                  here
                </Link>
              </p>
            </div>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}

export default LoginPage
