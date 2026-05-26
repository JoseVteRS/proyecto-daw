import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

type MonthHeaderProps = {
  label: string
}

export function MonthHeader({ label }: MonthHeaderProps) {
  return (
    <section className="mt-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold leading-none">{label}</h2>
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
