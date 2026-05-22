import { CalendarDays, List, Tag, User } from 'lucide-react'

import { cn } from '@/lib/utils'

const navItems = [
  { icon: CalendarDays, label: 'Calendario', active: true },
  { icon: List, label: 'Eventos', active: false },
  { icon: Tag, label: 'Categorías', active: false },
  { icon: User, label: 'Perfil', active: false },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 pb-[max(env(safe-area-inset-bottom),0.25rem)] backdrop-blur">
      <div className="mx-auto grid w-full max-w-md grid-cols-4">
        {navItems.map((item) => (
          <button className="flex min-h-14 flex-col items-center justify-center gap-1 text-xs" key={item.label} type="button">
            <item.icon className={cn('size-4', item.active ? 'text-foreground' : 'text-muted-foreground')} />
            <span className={cn(item.active ? 'text-foreground' : 'text-muted-foreground')}>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
