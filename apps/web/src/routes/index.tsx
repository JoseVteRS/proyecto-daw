import { Link, createFileRoute } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="min-h-screen bg-white px-6 py-8 text-black">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="text-xl font-semibold">Zengenda</div>
        <div className="flex items-center gap-3">
          <Button render={<Link to="/auth/login" />} variant="ghost">
            Iniciar sesión
          </Button>
          <Button render={<Link to="/auth/register" />} variant="default">
            Crear cuenta
          </Button>
        </div>
      </nav>

      <section className="mx-auto flex max-w-6xl flex-col items-center py-24 text-center">
        <div className="mb-6 rounded-full border border-black/10 px-4 py-2 text-sm font-medium">
          Agenda personal con foco y claridad
        </div>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
          Organiza tus eventos sin perder tiempo.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-black/60">
          Zengenda te ayuda a gestionar eventos, categorías y prioridades con una interfaz sencilla y directa.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button render={<Link to="/auth/register" />} size="lg" variant="default">
            Empezar ahora
          </Button>
          <Button render={<Link to="/auth/login" />} size="lg" variant="outline">
            Ya tengo cuenta
          </Button>
        </div>
      </section>
    </main>
  )
}
