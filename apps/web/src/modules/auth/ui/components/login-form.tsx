import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


import { loginUser } from '../../server/api'

export function LoginForm() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await loginUser(value)
        await navigate({ to: '/' })
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Ha ocurrido un error inesperado.')
      }
    },
  })

  return (
    <Card className="mx-auto w-full max-w-md border-black/15">
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
        <CardContent className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor={field.name}>Correo electrónico</Label>
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
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => (!value ? 'La contraseña es obligatoria.' : undefined),
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Contraseña</Label>
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
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button className="w-full" type="submit" variant="accent" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Iniciar sesión'}
              </Button>
            )}
          </form.Subscribe>
          <p className="text-center text-sm text-black/60">
            ¿No tienes cuenta?{' '}
            <Link className="font-medium text-black underline decoration-[#0aca97] underline-offset-4" to="/auth/register">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

function FieldError({ errors }: { errors: Array<unknown> }) {
  const message = errors.find((fieldError) => typeof fieldError === 'string')

  if (!message) {
    return null
  }

  return <p className="text-sm text-red-600">{message}</p>
}
