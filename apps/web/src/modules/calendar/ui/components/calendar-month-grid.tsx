import { cn } from '@/lib/utils'
import { buildMonthMatrix, isToday } from '@/modules/calendar/lib/calendar'
import { EventChip } from '@/modules/calendar/ui/components/event-chip'
import { useCalendarSelectedDate } from '@/modules/calendar/ui/context/calendar-selected-date-context'
import type { CalendarEvent } from '@/modules/calendar/ui/data/mock-events'
import { Link } from '@tanstack/react-router'

const weekDays = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']

type CalendarMonthGridProps = {
  monthDate: Date
  events: Array<CalendarEvent>
}

export function CalendarMonthGrid({ monthDate, events }: CalendarMonthGridProps) {
  const { setSelectedDate } = useCalendarSelectedDate()
  const month = monthDate.getMonth()
  const weeks = buildMonthMatrix(monthDate)
  const eventsByDate = groupEventsByDate(events)

  return (
    <section className="flex min-h-0 flex-1 flex-col py-1.5">
      <div className="grid shrink-0 grid-cols-7 text-center text-[10px] font-medium text-muted-foreground">
        {weekDays.map((weekDay) => (
          <div className="py-2" key={weekDay}>
            {weekDay}
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-1">
        {weeks.flat().map((day) => {
          const dayKey = formatDateKey(day)
          const dayEvents = eventsByDate[dayKey] ?? []
          const isCurrentMonth = day.getMonth() === month

          return (
            <Link
              to="/app/crear-evento"
              className="flex min-h-0 flex-col rounded-sm bg-accent/50 p-1 text-center"
              key={dayKey}
              onClick={() => setSelectedDate(new Date(day))}
            >
              <div
                className={cn(
                  'mb-1 inline-flex shrink-0 items-center justify-center self-center rounded-full text-xs font-medium',
                  isToday(day) && 'bg-primary px-2 py-0.5 text-background',
                  !isCurrentMonth && 'text-muted-foreground',
                )}
              >
                {day.getDate()}
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
                {dayEvents.map((event) => (
                  <EventChip key={event.id} event={event} showTime={false} className="w-full justify-start" />
                ))}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function groupEventsByDate(events: Array<CalendarEvent>) {
  return events.reduce<Record<string, Array<CalendarEvent>>>((groupedEvents, event) => {
    const eventStart = parseDateKey(event.startDate)
    const eventEnd = parseDateKey(event.endDate)
    const firstDay = eventStart.getTime() <= eventEnd.getTime() ? eventStart : eventEnd
    const lastDay = eventStart.getTime() <= eventEnd.getTime() ? eventEnd : eventStart

    for (let day = new Date(firstDay); day.getTime() <= lastDay.getTime(); day = addDays(day, 1)) {
      const dayKey = formatDateKey(day)

      if (!groupedEvents[dayKey]) {
        groupedEvents[dayKey] = []
      }

      groupedEvents[dayKey].push(event)
    }

    return groupedEvents
  }, {})
}
