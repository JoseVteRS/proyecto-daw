import { createFileRoute } from '@tanstack/react-router'

import { CalendarView } from '@/modules/calendar/ui/views/calendar-view'

export const Route = createFileRoute('/app/')({
  component: CalendarView,
})
