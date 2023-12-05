import { LoginForm } from './components/login-form'

const LoginPage = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="h-full w-1/2 bg-muted" />

      <div className="flex w-1/2 items-center justify-center">
        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage
