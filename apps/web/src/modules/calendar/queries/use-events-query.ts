import { useQuery } from '@tanstack/react-query'

import { listEvents } from '@/modules/calendar/server/api'

import { eventsKeys, type EventsFilters } from './events-keys'

export function useEventsQuery(filters: EventsFilters = {}) {
  return useQuery({
    queryKey: eventsKeys.list(filters),
    queryFn: () => listEvents(filters),
    select: (data) => data.events,
  })
}
