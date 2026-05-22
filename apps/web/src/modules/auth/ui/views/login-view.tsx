import { AuthLayout } from '../components/auth-layout'
import { LoginForm } from '../components/login-form'

export function LoginView() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
