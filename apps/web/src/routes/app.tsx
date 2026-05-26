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
      <main>
        <AppHeader />
        <div>
          <Outlet />
        </div>
        <BottomNav />
      </main>
    </CalendarSelectedDateProvider>
  )
}
