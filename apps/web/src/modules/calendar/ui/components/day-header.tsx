import { ChevronLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { cn } from '@/lib/utils'
import { isToday } from '@/modules/calendar/lib/calendar'

type DayHeaderProps = {
  date: Date
}

export function DayHeader({ date }: DayHeaderProps) {
  const monthLabel = formatMonthLabel(date)
  const weekDayLabel = formatWeekDayLabel(date)

  return (
    <section className="w-auto max-w-full mt-3 space-y-1 sticky top-14 bg-background">
      <div className="flex items-center gap-1">
        <Link
          to="/app"
          aria-label="Volver al calendario"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <p className="text-xs font-medium uppercase text-muted-foreground">{monthLabel}</p>
      </div>

      <div className="flex flex-col sticky top-10">
        <span className="text-xs lowercase font-medium tracking-wide text-muted-foreground">
          {weekDayLabel}
        </span>
        <span
          className={cn(
            'text-sm font-semibold leading-none',
            isToday(date) ? 'text-primary' : 'text-foreground',
          )}
        >
          {date.getDate()}
        </span>
      </div>
    </section>
  )
}

function formatMonthLabel(date: Date) {
  const label = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
  }).format(date)
  return capitalize(label)
}

function formatWeekDayLabel(date: Date) {
  const label = new Intl.DateTimeFormat('es-ES', { weekday: 'short' })
    .format(date)
    .replace('.', '')
  return capitalize(label)
}

function capitalize(value: string) {
  if (!value) {
    return value
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}
