import { createFileRoute } from '@tanstack/react-router'

import { EventsView } from '@/modules/calendar/ui/views/events-view'

export const Route = createFileRoute('/app/eventos')({
  component: EventsView,
})
