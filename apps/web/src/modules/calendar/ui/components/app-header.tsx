import { Bell } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/modules/auth/ui/auth-context'

export function AppHeader() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const initials = (user?.name ?? 'Usuario')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = async () => {
    await logout()
    await navigate({ to: '/' })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="font-display text-xl font-bold leading-none">
            <span className="text-primary">Zen</span>
            <span className="text-foreground">genda</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => void handleLogout()} size="sm" variant="outline">
            Cerrar sesión
          </Button>
          <Button aria-label="Notificaciones" size="icon" variant="ghost">
            <Bell className="size-4" />
          </Button>
          <Avatar className="size-9">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
