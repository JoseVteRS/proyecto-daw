import { Link, useRouterState } from '@tanstack/react-router'
import { CalendarDays, List, Tag, User } from 'lucide-react'

import { cn } from '@/lib/utils'

const navItems = [
  { icon: CalendarDays, label: 'Calendario', to: '/app', activePaths: ['/app'] },
  { icon: List, label: 'Eventos' },
  { icon: Tag, label: 'Categorías', to: '/app/categorias', activePaths: ['/app/categorias'] },
  { icon: User, label: 'Perfil' },
]

export function BottomNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  function isItemActive(item: (typeof navItems)[number]) {
    if (!item.activePaths) {
      return false
    }

    return item.activePaths.some((activePath) => (activePath === '/app' ? pathname === '/app' : pathname.startsWith(activePath)))
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 pb-[max(env(safe-area-inset-bottom),0.25rem)] backdrop-blur">
      <div className="mx-auto grid w-full max-w-md grid-cols-4">
        {navItems.map((item) => {
          const active = isItemActive(item)

          if (!item.to) {
            return (
              <button className="flex min-h-14 flex-col items-center justify-center gap-1 text-xs" key={item.label} type="button">
                <item.icon className={cn('size-4 text-muted-foreground')} />
                <span className={cn('text-muted-foreground')}>{item.label}</span>
              </button>
            )
          }

          return (
            <Link to={item.to} key={item.label} className="flex min-h-14 flex-col items-center justify-center gap-1 text-xs">
              <item.icon className={cn('size-4', active ? 'text-foreground' : 'text-muted-foreground')} />
              <span className={cn(active ? 'text-foreground' : 'text-muted-foreground')}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
