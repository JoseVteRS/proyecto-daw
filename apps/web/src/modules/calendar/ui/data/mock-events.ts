export type CalendarEventColor = 'blue' | 'green' | 'slate'

export type CalendarEvent = {
  id: string
  date: string
  time: string
  title: string
  color: CalendarEventColor
  startMinutes: number
  endMinutes: number
}
