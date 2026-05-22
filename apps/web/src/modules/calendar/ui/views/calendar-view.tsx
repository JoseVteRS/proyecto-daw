import { AppHeader } from '@/modules/calendar/ui/components/app-header'
import { BottomNav } from '@/modules/calendar/ui/components/bottom-nav'
import { CalendarMonthGrid } from '@/modules/calendar/ui/components/calendar-month-grid'
import { Fab } from '@/modules/calendar/ui/components/fab'
import { MonthHeader } from '@/modules/calendar/ui/components/month-header'
import { ViewTabs } from '@/modules/calendar/ui/components/view-tabs'
import { mockEvents } from '@/modules/calendar/ui/data/mock-events'

const monthDate = new Date(2026, 4, 1)

export function CalendarView() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background text-foreground">
      <AppHeader />
      <main className="flex-1 px-4 pb-28">
        <MonthHeader label="Mayo 2026" />
        <ViewTabs />
        <div className="mt-3">
          <CalendarMonthGrid monthDate={monthDate} events={mockEvents} />
        </div>
      </main>
      <Fab />
      <BottomNav />
    </div>
  )
}
