import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { FormAlert, FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/modules/auth/ui/auth-context'

import { loginUser } from '../../server/api'

export function LoginForm() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const response = await loginUser(value)
        setUser(response.user)
        await navigate({ to: '/app' })
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Ha ocurrido un error inesperado.')
      }
    },
  })

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>Accede con tu correo y contraseña.</CardDescription>
      </CardHeader>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <CardContent>
          <FieldGroup>
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'El correo electrónico es obligatorio.'
                  if (!/^\S+@\S+\.\S+$/.test(value)) return 'Introduce un correo electrónico válido.'
                  return undefined
                },
              }}
            >
              {(field) => (
                <FormField label="Correo electrónico" htmlFor={field.name} errors={field.state.meta.errors}>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    maxLength={255}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    required
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => (!value ? 'La contraseña es obligatoria.' : undefined),
              }}
            >
              {(field) => (
                <FormField label="Contraseña" htmlFor={field.name} errors={field.state.meta.errors}>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="current-password"
                    minLength={1}
                    maxLength={72}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    required
                  />
                </FormField>
              )}
            </form.Field>

            {error ? <FormAlert message={error} /> : null}
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button className="w-full" type="submit" variant="default" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Iniciar sesión'}
              </Button>
            )}
          </form.Subscribe>
          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link className="font-medium text-primary underline underline-offset-4" to="/auth/register">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
