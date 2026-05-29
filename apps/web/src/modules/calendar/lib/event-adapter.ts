import type { EventResponse } from '@proyecto-daw/shared'

import type { CalendarEvent, CalendarEventColor } from '@/modules/calendar/ui/data/mock-events'

export function toCalendarEvent(event: EventResponse['event']): CalendarEvent {
  const start = new Date(event.eventDateStart)
  const end = new Date(event.eventDateEnd)
  const startMinutes = getMinutesSinceDayStart(start)
  const rawEndMinutes = getMinutesSinceDayStart(end)
  const endMinutes = rawEndMinutes <= startMinutes ? 24 * 60 : rawEndMinutes

  return {
    id: event.id,
    date: formatDate(start),
    startDate: formatDate(start),
    endDate: formatDate(end),
    time: formatTime(start),
    title: event.name,
    color: priorityToColor(event.priorityId),
    startMinutes,
    endMinutes,
  }
}

function priorityToColor(priorityId: number): CalendarEventColor {
  if (priorityId === 3) return 'green'
  if (priorityId === 1) return 'slate'
  return 'blue'
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTime(date: Date): string {
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${hour}:${minute}`
}

function getMinutesSinceDayStart(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}
