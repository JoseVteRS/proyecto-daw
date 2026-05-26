import { useMemo, useState } from 'react'

import { CreateEventDrawer } from '@/modules/calendar/ui/components/create-event-drawer'
import { DayHeader } from '@/modules/calendar/ui/components/day-header'
import { DayHourGrid } from '@/modules/calendar/ui/components/day-hour-grid'

type DayViewProps = {
  date: Date
}

export function DayView({ date }: DayViewProps) {
  const [open, setOpen] = useState(false)
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const initialStart = useMemo(() => {
    const hour = selectedHour ?? 0
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0)
  }, [date, selectedHour])

  function handleSelectHour(hour: number) {
    setSelectedHour(hour)
    setOpen(true)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background text-foreground">
      <main className="flex-1 px-4 pb-28">
        <DayHeader date={date} />

        <div className="mt-3">
          <DayHourGrid highlightedHour={selectedHour ?? undefined} onSelectHour={handleSelectHour} />
        </div>
      </main>
      <CreateEventDrawer open={open} onOpenChange={setOpen} initialStart={initialStart} showTrigger={false} />
    </div>
  )
}
