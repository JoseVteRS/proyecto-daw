import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

type MonthHeaderProps = {
  label: string
}

export function MonthHeader({ label }: MonthHeaderProps) {
  return (
    <section className="mt-4 mb-3">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-4xl font-semibold leading-none">{label}</h1>
        <div className="flex items-center gap-1">
          <Button aria-label="Mes anterior" size="icon" variant="ghost">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost">Hoy</Button>
          <Button aria-label="Mes siguiente" size="icon" variant="ghost">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
