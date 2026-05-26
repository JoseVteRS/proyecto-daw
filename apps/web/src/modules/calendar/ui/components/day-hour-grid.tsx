import { cn } from '@/lib/utils'

type DayHourGridProps = {
  highlightedHour?: number
  onSelectHour?: (hour: number) => void
}

export function DayHourGrid({ highlightedHour, onSelectHour }: DayHourGridProps) {
  return (
    <div>
      {Array.from({ length: 24 }, (_, hour) => (
        <div key={hour} className="grid grid-cols-[56px_1fr]">
          <div
            className={cn(
              'pr-2 text-right text-[11px] font-medium text-muted-foreground',
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
              'my-0.5 h-10 rounded-md bg-muted hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              highlightedHour === hour && 'bg-accent/30',
            )}
          />
        </div>
      ))}
    </div>
  )
}
