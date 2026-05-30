import { useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/95 px-3 py-2 backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="font-display text-xl font-bold leading-none">
            <span className="text-primary">Zen</span>
            <span className="text-foreground">genda</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Abrir menú de usuario"
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Avatar className="size-9 border-border/80 bg-muted/60">
                <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium leading-none">{user?.name ?? 'Usuario'}</p>
                {user?.email ? <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p> : null}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void handleLogout()}>
                <LogOut className="size-4" />
                Salir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
