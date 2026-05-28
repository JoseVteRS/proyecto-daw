import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { getMe } from '@/modules/auth/server/api'
import { AppHeader } from '@/modules/calendar/ui/components/app-header'
import { BottomNav } from '@/modules/calendar/ui/components/bottom-nav'
import { CalendarSelectedDateProvider } from '@/modules/calendar/ui/context/calendar-selected-date-context'

export const Route = createFileRoute('/app')({
  beforeLoad: async () => {
    if (typeof window === 'undefined') {
      return
    }

    const me = await getMe()

    if (!me) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: AppRoute,
})

function AppRoute() {
  return (
    <CalendarSelectedDateProvider>
      <main className="flex min-h-dvh flex-col bg-background">
        <AppHeader />
        <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col pb-[calc(3.5rem+max(env(safe-area-inset-bottom,0px),0.25rem))]">
          <Outlet />
        </div>
        <BottomNav />
      </main>
    </CalendarSelectedDateProvider>
  )
}
