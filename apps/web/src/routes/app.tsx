import { createFileRoute, redirect } from '@tanstack/react-router'

import { getMe } from '@/modules/auth/server/api'
import { CalendarView } from '@/modules/calendar/ui/views/calendar-view'

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
  component: CalendarView,
})
