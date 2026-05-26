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
      <div className="grid grid-cols-7 border-b border-border text-center text-[10px] font-medium text-muted-foreground">
        {weekDays.map((weekDay) => (
          <div className="py-2" key={weekDay}>
            {weekDay}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 min-h-[95dvh]">
        {weeks.flat().map((day) => {
          const dayKey = formatDateKey(day)
          const dayEvents = eventsByDate[dayKey] ?? []
          const isCurrentMonth = day.getMonth() === month

          return (
            <Link
              to="/app/crear-evento"
              className="block min-h-20 border-b border-r border-border p-1.5"
              key={dayKey}
              onClick={() => setSelectedDate(new Date(day))}
            >
              <div
                className={cn(
                  'mb-1 inline-flex size-6 items-center justify-center rounded-full text-xs font-medium',
                  isToday(day) && 'bg-foreground text-background',
                  !isCurrentMonth && 'text-muted-foreground',
                )}
              >
                {day.getDate()}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <EventChip key={event.id} event={event} />
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
