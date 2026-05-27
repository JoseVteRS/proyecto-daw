export type EventsFilters = {
  from?: string
  to?: string
}

export const eventsKeys = {
  all: ['events'] as const,
  lists: () => [...eventsKeys.all, 'list'] as const,
  list: (filters: EventsFilters = {}) => [...eventsKeys.lists(), filters] as const,
}
