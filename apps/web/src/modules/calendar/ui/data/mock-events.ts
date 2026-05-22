export type CalendarEventColor = 'blue' | 'green' | 'slate'

export type CalendarEvent = {
  id: string
  date: string
  time: string
  title: string
  color: CalendarEventColor
}

export const mockEvents: Array<CalendarEvent> = [
  {
    id: 'evt-2026-05-02-1000',
    date: '2026-05-02',
    time: '10:00',
    title: 'Reunión',
    color: 'blue',
  },
  {
    id: 'evt-2026-05-04-1630',
    date: '2026-05-04',
    time: '16:30',
    title: 'Café',
    color: 'green',
  },
  {
    id: 'evt-2026-05-23-1100',
    date: '2026-05-23',
    time: '11:00',
    title: 'Boda',
    color: 'slate',
  },
]
