import { useMemo, useState } from 'react'

import { addMonths, buildMonthMatrix, startOfMonth } from '@/modules/calendar/lib/calendar'
import { toCalendarEvent } from '@/modules/calendar/lib/event-adapter'
import { useEventsQuery } from '@/modules/calendar/queries/use-events-query'
import { CalendarMonthGrid } from '@/modules/calendar/ui/components/calendar-month-grid'
import { CreateEventDrawer } from '@/modules/calendar/ui/components/create-event-drawer'
import { MonthHeader } from '@/modules/calendar/ui/components/month-header'

export function CalendarView() {
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()))
  const monthMatrix = buildMonthMatrix(monthDate)
  const gridStart = monthMatrix[0]?.[0] ?? new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const gridEnd = monthMatrix[monthMatrix.length - 1]?.[6] ?? new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
  const rangeStart = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate(), 0, 0, 0, 0)
  const rangeEnd = new Date(gridEnd.getFullYear(), gridEnd.getMonth(), gridEnd.getDate(), 23, 59, 59, 999)
  const monthLabel = useMemo(() => new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(monthDate).toUpperCase(), [monthDate])
  const yearLabel = useMemo(() => new Intl.DateTimeFormat('es-ES', { year: 'numeric' }).format(monthDate), [monthDate])
  const eventsQuery = useEventsQuery({
    from: rangeStart.toISOString(),
    to: rangeEnd.toISOString(),
  })
  const events = (eventsQuery.data ?? []).map(toCalendarEvent)

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col text-foreground">
      <div className="flex min-h-0 flex-1 flex-col px-4">
        <MonthHeader
          monthLabel={monthLabel}
          yearLabel={yearLabel}
          onNextMonth={() => setMonthDate((currentMonth) => addMonths(currentMonth, 1))}
          onPreviousMonth={() => setMonthDate((currentMonth) => addMonths(currentMonth, -1))}
        />
        {eventsQuery.isError ? <p className="mt-2 text-sm text-red-600">No se pudieron cargar los eventos.</p> : null}
        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          <CalendarMonthGrid monthDate={monthDate} events={events} />
        </div>
      </div>
      <CreateEventDrawer />
    </div>
  )
}
