import { useMemo, useState } from 'react'

import { toCalendarEvent } from '@/modules/calendar/lib/event-adapter'
import { useEventsQuery } from '@/modules/calendar/queries/use-events-query'
import { CreateEventDrawer } from '@/modules/calendar/ui/components/create-event-drawer'
import { DayHeader } from '@/modules/calendar/ui/components/day-header'
import { DayHourGrid } from '@/modules/calendar/ui/components/day-hour-grid'

type DayViewProps = {
  date: Date
}

export function DayView({ date }: DayViewProps) {
  const [open, setOpen] = useState(false)
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const initialStart = useMemo(() => {
    const hour = selectedHour ?? 0
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0)
  }, [date, selectedHour])
  const dayStart = useMemo(() => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0), [date])
  const dayEnd = useMemo(() => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999), [date])
  const eventsQuery = useEventsQuery({
    from: dayStart.toISOString(),
    to: dayEnd.toISOString(),
  })
  const events = useMemo(() => (eventsQuery.data ?? []).map(toCalendarEvent), [eventsQuery.data])

  function handleSelectHour(hour: number) {
    setSelectedHour(hour)
    setOpen(true)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background text-foreground">
      <main className="flex-1 px-4 pb-28">
        <DayHeader date={date} />
        {eventsQuery.isError ? <p className="mt-2 text-sm text-red-600">No se pudieron cargar los eventos.</p> : null}

        <div className="mt-3">
          <DayHourGrid highlightedHour={selectedHour ?? undefined} onSelectHour={handleSelectHour} events={events} />
        </div>
      </main>
      <CreateEventDrawer open={open} onOpenChange={setOpen} initialStart={initialStart} showTrigger={false} />
    </div>
  )
}
