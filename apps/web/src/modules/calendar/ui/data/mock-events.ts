export type CalendarEventColor = 'blue' | 'green' | 'slate'

export type CalendarEvent = {
  id: string
  date: string
  startDate: string
  endDate: string
  time: string
  title: string
  color: CalendarEventColor
  startMinutes: number
  endMinutes: number
}
