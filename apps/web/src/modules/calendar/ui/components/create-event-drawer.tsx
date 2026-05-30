import { Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useCreateEventDrawer } from '@/modules/calendar/hooks/use-create-event-drawer'
import { CreateEventForm } from '@/modules/calendar/ui/components/create-event-form'

type CreateEventDrawerProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  initialStart?: Date
  showTrigger?: boolean
}

export function CreateEventDrawer({
  open,
  onOpenChange,
  initialStart,
  showTrigger = true,
}: CreateEventDrawerProps) {
  const drawer = useCreateEventDrawer({ open, onOpenChange, initialStart })

  return (
    <Drawer open={drawer.isOpen} onOpenChange={drawer.handleOpenChange}>
      {showTrigger ? (
        <DrawerTrigger asChild>
          <Button
            aria-label="Crear evento"
            className="fixed right-5 bottom-20 z-30 size-12 rounded-mc shadow-lg"
            size="icon"
            variant="default"
          >
            <Plus className="size-5" />
          </Button>
        </DrawerTrigger>
      ) : null}
      <DrawerContent>
        <DrawerHeader className="flex-row items-center justify-between gap-2 pb-3">
          <DrawerTitle>Nuevo evento</DrawerTitle>
          <DrawerClose asChild>
            <Button type="button" variant="ghost" size="icon" aria-label="Cerrar formulario">
              <X className="size-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <CreateEventForm
          form={drawer.form}
          allDay={drawer.allDay}
          setAllDay={drawer.setAllDay}
          isMultiDay={drawer.isMultiDay}
          setIsMultiDay={drawer.setIsMultiDay}
          error={drawer.error}
          isPending={drawer.isPending}
          startDateLabel={drawer.startDateLabel}
        />
      </DrawerContent>
    </Drawer>
  )
}
