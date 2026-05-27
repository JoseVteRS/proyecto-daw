import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/modules/calendar/ui/data/mock-events'

const chipColorClasses: Record<CalendarEvent['color'], string> = {
  blue: 'bg-blue-500 text-white',
  green: 'bg-emerald-400 text-foreground',
  slate: 'bg-slate-200 text-foreground',
}

type EventChipProps = {
  event: CalendarEvent
  showTime?: boolean
  className?: string
}

export function EventChip({ event, showTime = true, className }: EventChipProps) {
  return (
    <Badge
      className={cn(
        'flex max-w-full truncate rounded-xs border-0 px-0.5 py-0.5 text-[9px]  leading-none',
        chipColorClasses[event.color],
        className,
      )}
    >
      {showTime ? `${event.time} ${event.title}` : event.title}
    </Badge>
  )
}
