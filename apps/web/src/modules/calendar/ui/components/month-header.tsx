import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

type MonthHeaderProps = {
  monthLabel: string
  yearLabel: string
  onPreviousMonth: () => void
  onNextMonth: () => void
}

export function MonthHeader({ monthLabel, yearLabel, onPreviousMonth, onNextMonth }: MonthHeaderProps) {
  return (
    <section className="mt-3">
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-1">
          <Button aria-label="Mes anterior" onClick={onPreviousMonth} size="icon" variant="ghost">
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="min-w-28 text-center text-lg font-semibold uppercase leading-none">{monthLabel}</h2>
          <Button aria-label="Mes siguiente" onClick={onNextMonth} size="icon" variant="ghost">
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <p className="text-center text-sm font-medium text-muted-foreground">{yearLabel}</p>
      </div>
    </section>
  )
}
