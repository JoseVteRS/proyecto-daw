import { AuthLayout } from '../components/auth-layout'
import { RegisterForm } from '../components/register-form'

export function RegisterView() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  )
}
