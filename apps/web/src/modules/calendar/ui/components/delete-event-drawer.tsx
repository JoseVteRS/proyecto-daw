import type { EventResponse } from '@proyecto-daw/shared'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
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
          <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
        </DrawerHeader>
        {error ? (
          <div role="alert" className="mx-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        <DrawerFooter>
          <Button
            type="button"
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={() => void handleDelete()}
            disabled={deleteEventMutation.isPending}
          >
            {deleteEventMutation.isPending ? 'Eliminando...' : 'Sí, eliminar'}
          </Button>
          <DrawerClose
            render={
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            }
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
