import { CalendarMonthGrid } from '@/modules/calendar/ui/components/calendar-month-grid'
import { CreateEventDrawer } from '@/modules/calendar/ui/components/create-event-drawer'
import { MonthHeader } from '@/modules/calendar/ui/components/month-header'
import { toCalendarEvent } from '@/modules/calendar/lib/event-adapter'
import { useEventsQuery } from '@/modules/calendar/queries/use-events-query'

const monthDate = new Date()

export function CalendarView() {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 0, 0, 0, 0)
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999)
  const monthLabel = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(monthDate)
  const eventsQuery = useEventsQuery({
    from: monthStart.toISOString(),
    to: monthEnd.toISOString(),
  })
  const events = (eventsQuery.data ?? []).map(toCalendarEvent)

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background text-foreground">
      <main className="flex-1 px-4 pb-28">
        <MonthHeader label={monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)} />
        {eventsQuery.isError ? <p className="mt-2 text-sm text-red-600">No se pudieron cargar los eventos.</p> : null}
        <div className="mt-3">
          <CalendarMonthGrid monthDate={monthDate} events={events} />
        </div>
      </main>
      <CreateEventDrawer />
    </div>
  )
}
