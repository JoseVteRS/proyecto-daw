import { type ReactNode } from 'react'

type AuthLayoutProps = {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-white px-4 py-10 text-black sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full gap-10 lg:grid-cols-[1fr_440px] lg:items-center">
          <section className="hidden lg:block">
            <div className="mb-6 inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-medium">
              <span className="mr-2 h-2 w-2 self-center rounded-full bg-[#0aca97]" />
              Zengenda
            </div>
            <h1 className="max-w-xl text-5xl font-semibold tracking-tight">
              Organiza tu agenda con una experiencia clara y rápida.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-black/60">
              Gestiona eventos, categorías y prioridades desde una interfaz sencilla, con blanco, negro y verde como identidad principal.
            </p>
          </section>

          {children}
        </div>
      </div>
    </main>
  )
}
