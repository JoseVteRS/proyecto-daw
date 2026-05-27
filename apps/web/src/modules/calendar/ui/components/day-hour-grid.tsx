import { cn } from '@/lib/utils'
import { EventChip } from '@/modules/calendar/ui/components/event-chip'
import type { CalendarEvent } from '@/modules/calendar/ui/data/mock-events'

type DayHourGridProps = {
  highlightedHour?: number
  onSelectHour?: (hour: number) => void
  onSelectEvent?: (eventId: string) => void
  events?: Array<CalendarEvent>
}

const HOUR_PX = 44

export function DayHourGrid({ highlightedHour, onSelectHour, onSelectEvent, events = [] }: DayHourGridProps) {
  return (
    <div className="relative" style={{ height: HOUR_PX * 24 }}>
      {Array.from({ length: 24 }, (_, hour) => (
        <div key={hour} className="grid h-11 grid-cols-[56px_1fr]">
          <div
            className={cn(
              'pr-2 pt-1 text-right text-[11px] font-medium text-muted-foreground',
              highlightedHour === hour && 'text-foreground',
            )}
          >
            {hour.toString().padStart(2, '0')}:00
          </div>
          <button
            type="button"
            aria-label={`Crear evento a las ${hour.toString().padStart(2, '0')}:00`}
            onClick={() => onSelectHour?.(hour)}
            className={cn(
              'my-0.5 h-10 w-full rounded-md bg-muted hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              highlightedHour === hour && 'bg-accent/30',
            )}
          />
        </div>
      ))}

      <div className="pointer-events-none absolute inset-y-0 left-14 right-0">
        {events.map((event) => {
          const eventHeight = ((event.endMinutes - event.startMinutes) / 60) * HOUR_PX

          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelectEvent?.(event.id)}
              aria-label={`Ver evento ${event.title}`}
              className="pointer-events-auto absolute inset-x-0 px-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                top: (event.startMinutes / 60) * HOUR_PX,
                height: Math.max(eventHeight, 18),
              }}
            >
              <EventChip
                event={event}
                showTime={false}
                className="mt-0 flex h-full w-full cursor-pointer items-start rounded-md px-2 py-1 text-xs leading-tight"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
