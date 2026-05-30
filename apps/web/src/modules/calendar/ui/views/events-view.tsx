import type { EventResponse } from '@proyecto-daw/shared'
import { useMemo, useState } from 'react'

import { Switch } from '@/components/ui/switch'
import { useEventsQuery } from '@/modules/calendar/queries/use-events-query'
import { DeleteEventDrawer } from '@/modules/calendar/ui/components/delete-event-drawer'
import { EventDetailsDrawer } from '@/modules/calendar/ui/components/event-details-drawer'
import { EventListItem } from '@/modules/calendar/ui/components/event-list-item'

type EventItem = EventResponse['event']

export function EventsView() {
  const [showPastEvents, setShowPastEvents] = useState(false)
  const [nowIso] = useState(() => new Date().toISOString())
  const eventsFilters = useMemo(
    () => (showPastEvents ? {} : { from: nowIso }),
    [nowIso, showPastEvents],
  )
  const eventsQuery = useEventsQuery(eventsFilters)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const events = useMemo(() => {
    const list = eventsQuery.data ?? []
    return [...list].sort(
      (a, b) => new Date(a.eventDateStart).getTime() - new Date(b.eventDateStart).getTime(),
    )
  }, [eventsQuery.data])

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId],
  )

  function handleEdit(event: EventItem) {
    setSelectedEventId(event.id)
    setDetailsOpen(true)
  }

  function handleDelete(event: EventItem) {
    setSelectedEventId(event.id)
    setDeleteOpen(true)
  }

  function handleDetailsOpenChange(nextOpen: boolean) {
    setDetailsOpen(nextOpen)
    if (!nextOpen) {
      setSelectedEventId(null)
    }
  }

  function handleDeleteOpenChange(nextOpen: boolean) {
    setDeleteOpen(nextOpen)
    if (!nextOpen) {
      setSelectedEventId(null)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col text-foreground">
      <div className="flex min-h-0 flex-1 flex-col px-4 py-4">
        <h2 className="text-lg font-semibold">Eventos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {showPastEvents ? 'Todos tus eventos ordenados por fecha.' : 'Tus eventos próximos y en curso ordenados por fecha.'}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
          <label htmlFor="show-past-events" className="text-sm text-foreground">
            Mostrar eventos pasados
          </label>
          <Switch
            id="show-past-events"
            checked={showPastEvents}
            onCheckedChange={(checked) => setShowPastEvents(checked)}
            aria-label="Mostrar eventos pasados"
          />
        </div>

        {eventsQuery.isError ? <p className="mt-4 text-sm text-red-600">No se pudieron cargar los eventos.</p> : null}

        {eventsQuery.isLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-lg border border-border bg-muted/60" />
            ))}
          </div>
        ) : null}

        {!eventsQuery.isLoading && !eventsQuery.isError && events.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-border px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              {showPastEvents ? 'Aún no tienes eventos creados.' : 'No tienes eventos próximos ni en curso.'}
            </p>
          </div>
        ) : null}

        {!eventsQuery.isLoading && !eventsQuery.isError && events.length > 0 ? (
          <div className="mt-4 space-y-3 overflow-y-auto pb-4">
            {events.map((event) => (
              <EventListItem key={event.id} event={event} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        ) : null}
      </div>

      <EventDetailsDrawer open={detailsOpen} onOpenChange={handleDetailsOpenChange} event={selectedEvent} />
      <DeleteEventDrawer open={deleteOpen} onOpenChange={handleDeleteOpenChange} event={selectedEvent} />
    </div>
  )
}
