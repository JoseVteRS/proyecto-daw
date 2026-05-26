import { DayView } from '@/modules/calendar/ui/views/day-view'
import { useCalendarSelectedDate } from '@/modules/calendar/ui/context/calendar-selected-date-context'

export function CreateEventView() {
  const { selectedDate } = useCalendarSelectedDate()

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background text-foreground">
      <DayView date={selectedDate} />
    </div>
  )
}
