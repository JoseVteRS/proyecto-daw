import type { EventResponse } from '@proyecto-daw/shared'
import { useState } from 'react'

import { FormAlert } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useDeleteEventMutation } from '@/modules/calendar/queries/use-delete-event-mutation'

type DeleteEventDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: EventResponse['event'] | null
  onDeleted?: () => void
}

export function DeleteEventDrawer({ open, onOpenChange, event, onDeleted }: DeleteEventDrawerProps) {
  const [error, setError] = useState<string | null>(null)
  const deleteEventMutation = useDeleteEventMutation()

  async function handleDelete() {
    if (!event) {
      return
    }

    setError(null)
    try {
      await deleteEventMutation.mutateAsync(event.id)
      onOpenChange(false)
      onDeleted?.()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Ha ocurrido un error inesperado.')
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setError(null)
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>¿Eliminar evento?</DrawerTitle>
          <DrawerDescription>Esta acción no se puede deshacer.</DrawerDescription>
        </DrawerHeader>
        {error ? (
          <div className="px-4">
            <FormAlert message={error} />
          </div>
        ) : null}
        <DrawerFooter>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleDelete()}
            disabled={deleteEventMutation.isPending}
          >
            {deleteEventMutation.isPending ? 'Eliminando...' : 'Sí, eliminar'}
          </Button>
          <DrawerClose asChild>
            <Button type="button" variant="ghost">
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
