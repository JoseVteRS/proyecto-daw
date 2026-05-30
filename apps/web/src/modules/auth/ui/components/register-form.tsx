import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { FormAlert, FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/modules/auth/ui/auth-context'
import { loginUser, registerUser } from '../../server/api'

export function RegisterForm() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await registerUser(value)
        const response = await loginUser({ email: value.email, password: value.password })
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
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>Introduce tus datos para empezar a usar Zengenda.</CardDescription>
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
              name="name"
              validators={{
                onChange: ({ value }) => {
                  if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres.'
                  if (value.length > 100) return 'El nombre no puede superar 100 caracteres.'
                  return undefined
                },
              }}
            >
              {(field) => (
                <FormField label="Nombre" htmlFor={field.name} errors={field.state.meta.errors}>
                  <Input
                    id={field.name}
                    name={field.name}
                    autoComplete="name"
                    minLength={2}
                    maxLength={100}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    required
                  />
                </FormField>
              )}
            </form.Field>

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
                onChange: ({ value }) => {
                  if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
                  if (value.length > 72) return 'La contraseña no puede superar 72 caracteres.'
                  return undefined
                },
              }}
            >
              {(field) => (
                <FormField label="Contraseña" htmlFor={field.name} errors={field.state.meta.errors}>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
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
                {isSubmitting ? 'Enviando...' : 'Crear cuenta'}
              </Button>
            )}
          </form.Subscribe>
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link className="font-medium text-primary underline underline-offset-4" to="/auth/login">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
