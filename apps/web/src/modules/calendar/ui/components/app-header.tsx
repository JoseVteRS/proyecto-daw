import { Bell, CalendarDays } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-foreground text-background">
            <CalendarDays className="size-4" />
          </div>
          <div className="leading-none">
            <p className="text-sm font-semibold">Agenda</p>
            <p className="text-[11px] text-muted-foreground">2026</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button aria-label="Notificaciones" size="icon" variant="ghost">
            <Bell className="size-4" />
          </Button>
          <Avatar className="size-9">
            <AvatarFallback>JO</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
