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
    <section>
      <div className="grid grid-cols-7 text-center text-[10px] font-medium text-muted-foreground">
        {weekDays.map((weekDay) => (
          <div className="py-2" key={weekDay}>
            {weekDay}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 min-h-[95dvh] space-y-1 space-x-1">
        {weeks.flat().map((day) => {
          const dayKey = formatDateKey(day)
          const dayEvents = eventsByDate[dayKey] ?? []
          const isCurrentMonth = day.getMonth() === month

          return (
            <Link
              to="/app/crear-evento"
              className="block min-h-20 text-center bg-accent/50 p-1 rounded-sm"
              key={dayKey}
              onClick={() => setSelectedDate(new Date(day))}
            >
              <div
                className={cn(
                  'mb-1 inline-flex items-center justify-center rounded-full text-xs font-medium',
                  isToday(day) && 'bg-primary text-background px-2 py-0.5',
                  !isCurrentMonth && 'text-muted-foreground',
                )}
              >
                {day.getDate()}
              </div>

              <div className="flex flex-col gap-0.5">
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

function groupEventsByDate(events: Array<CalendarEvent>) {
  return events.reduce<Record<string, Array<CalendarEvent>>>((groupedEvents, event) => {
    if (!groupedEvents[event.date]) {
      groupedEvents[event.date] = []
    }

    groupedEvents[event.date].push(event)
    return groupedEvents
  }, {})
}
