import { CreateEventView } from '@/modules/calendar/ui/views/create-event-view'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/crear-evento')({
  component: CreateEventView,
})
