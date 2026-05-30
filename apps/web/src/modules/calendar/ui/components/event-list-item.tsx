import type { EventResponse } from '@proyecto-daw/shared'
import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDateEs, formatTime, isSameDay } from '@/lib/date'

type EventItem = EventResponse['event']

type EventListItemProps = {
  event: EventItem
  onEdit: (event: EventItem) => void
  onDelete: (event: EventItem) => void
}

const priorityLabels: Record<number, { label: string; className: string }> = {
  1: { label: 'Baja', className: 'bg-slate-200 text-foreground' },
  2: { label: 'Media', className: 'bg-blue-500 text-white' },
  3: { label: 'Alta', className: 'bg-emerald-400 text-foreground' },
}

function isAllDay(start: Date, end: Date): boolean {
  return start.getHours() === 0 && start.getMinutes() === 0 && end.getHours() === 23 && end.getMinutes() === 59
}

function formatSchedule(event: EventItem): string {
  const start = new Date(event.eventDateStart)
  const end = new Date(event.eventDateEnd)

  if (isSameDay(start, end)) {
    if (isAllDay(start, end)) {
      return `${formatDateEs(start)} · Todo el día`
    }
    return `${formatDateEs(start)} · ${formatTime(start)} - ${formatTime(end)}`
  }

  return `${formatDateEs(start)} - ${formatDateEs(end)}`
}

export function EventListItem({ event, onEdit, onDelete }: EventListItemProps) {
  const priority = priorityLabels[event.priorityId] ?? priorityLabels[2]

  return (
    <article className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold', priority.className)}>
            {priority.label}
          </span>
          <h3 className="truncate text-sm font-semibold text-foreground">{event.name}</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{formatSchedule(event)}</p>
        {event.description ? (
          <p className="mt-1 truncate text-sm text-muted-foreground">{event.description}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Editar ${event.name}`}
          onClick={() => onEdit(event)}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-red-600 hover:bg-red-100 hover:text-red-700"
          aria-label={`Eliminar ${event.name}`}
          onClick={() => onDelete(event)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </article>
  )
}
