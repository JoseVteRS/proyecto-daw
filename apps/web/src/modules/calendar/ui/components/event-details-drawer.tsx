import type { EventResponse } from '@proyecto-daw/shared'
import { useForm } from '@tanstack/react-form'
import { Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { DateTimePicker } from '@/components/date-time-picker'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDeleteEventMutation } from '@/modules/calendar/queries/use-delete-event-mutation'
import { useUpdateEventMutation } from '@/modules/calendar/queries/use-update-event-mutation'

type PriorityValue = '1' | '2' | '3'

type FormValues = {
  name: string
  description: string
  eventDateStart: Date
  eventDateEnd: Date
  priorityId: PriorityValue
}

type EventDetailsDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: EventResponse['event'] | null
}

export function EventDetailsDrawer({ open, onOpenChange, event }: EventDetailsDrawerProps) {
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const updateEventMutation = useUpdateEventMutation()
  const deleteEventMutation = useDeleteEventMutation()

  const defaultValues = useMemo(() => toDefaultValues(event), [event])
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (!event) {
        return
      }

      setError(null)
      try {
        await updateEventMutation.mutateAsync({
          id: event.id,
          input: {
            name: value.name,
            description: value.description.trim(),
            eventDateStart: value.eventDateStart.toISOString(),
            eventDateEnd: value.eventDateEnd.toISOString(),
            priorityId: Number(value.priorityId),
          },
        })
        handleOpenChange(false)
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Ha ocurrido un error inesperado.')
      }
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    form.reset(toDefaultValues(event))
    setError(null)
    setConfirmDelete(false)
  }, [event, form, open])

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setError(null)
      setConfirmDelete(false)
    }
  }

  async function handleDelete() {
    if (!event) {
      return
    }

    setError(null)
    try {
      await deleteEventMutation.mutateAsync(event.id)
      handleOpenChange(false)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Ha ocurrido un error inesperado.')
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <DrawerTitle>{event?.name ?? 'Editar evento'}</DrawerTitle>
              <DrawerDescription>Actualiza o elimina este evento.</DrawerDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setConfirmDelete(true)}
              aria-label="Eliminar evento"
              disabled={!event || updateEventMutation.isPending || deleteEventMutation.isPending}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </DrawerHeader>
        <form
          onSubmit={(submitEvent) => {
            submitEvent.preventDefault()
            submitEvent.stopPropagation()
            void form.handleSubmit()
          }}
          className="flex flex-col gap-4 overflow-y-auto px-5 pt-2 pb-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const trimmed = value.trim()
                if (trimmed.length < 2) return 'El nombre debe tener al menos 2 caracteres.'
                if (trimmed.length > 150) return 'El nombre no puede superar 150 caracteres.'
                return undefined
              },
            }}
          >
            {(field) => (
              <FormRow>
                <Label htmlFor={field.name}>Nombre</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  maxLength={150}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(changeEvent) => field.handleChange(changeEvent.target.value)}
                  required
                  disabled={!event}
                />
                <FieldError errors={field.state.meta.errors} />
              </FormRow>
            )}
          </form.Field>

          <form.Field
            name="description"
            validators={{
              onChange: ({ value }) =>
                value.length > 2000 ? 'La descripción no puede superar 2000 caracteres.' : undefined,
            }}
          >
            {(field) => (
              <FormRow>
                <Label htmlFor={field.name}>Descripción</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  maxLength={2000}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(changeEvent) => field.handleChange(changeEvent.target.value)}
                  placeholder="Opcional"
                  disabled={!event}
                />
                <FieldError errors={field.state.meta.errors} />
              </FormRow>
            )}
          </form.Field>

          <div className="grid grid-cols-1 gap-3">
            <form.Field
              name="eventDateStart"
              validators={{
                onChange: ({ value }) => (!value ? 'Fecha de inicio obligatoria.' : undefined),
              }}
            >
              {(field) => (
                <FormRow>
                  <Label htmlFor={field.name}>Inicio</Label>
                  <DateTimePicker
                    id={field.name}
                    value={field.state.value}
                    onChange={(next) => {
                      const nextStart = next ?? new Date()
                      field.handleChange(nextStart)

                      const nextEnd = new Date(nextStart)
                      nextEnd.setHours(nextEnd.getHours() + 1)
                      form.setFieldValue('eventDateEnd', nextEnd)
                    }}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </FormRow>
              )}
            </form.Field>

            <form.Field
              name="eventDateEnd"
              validators={{
                onChangeListenTo: ['eventDateStart'],
                onChange: ({ value, fieldApi }) => {
                  if (!value) return 'Fecha de fin obligatoria.'
                  const start = fieldApi.form.getFieldValue('eventDateStart')
                  if (start && value.getTime() <= start.getTime()) {
                    return 'Debe ser posterior al inicio.'
                  }
                  return undefined
                },
              }}
            >
              {(field) => (
                <FormRow>
                  <Label htmlFor={field.name}>Fin</Label>
                  <DateTimePicker
                    id={field.name}
                    value={field.state.value}
                    onChange={(next) => {
                      field.handleChange(next ?? new Date())
                    }}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </FormRow>
              )}
            </form.Field>
          </div>

          <form.Field name="priorityId">
            {(field) => (
              <FormRow>
                <Label htmlFor={field.name}>Prioridad</Label>
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(changeEvent) => field.handleChange(changeEvent.target.value as PriorityValue)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  disabled={!event}
                >
                  <option value="1">Baja</option>
                  <option value="2">Media</option>
                  <option value="3">Alta</option>
                </select>
              </FormRow>
            )}
          </form.Field>

          {error ? (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </div>
          ) : null}

          <DrawerFooter className="px-0 pt-2 pb-0">
            <Button
              type="submit"
              variant="accent"
              disabled={!event || updateEventMutation.isPending || deleteEventMutation.isPending}
            >
              {updateEventMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
            <DrawerClose
              render={
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              }
            />
          </DrawerFooter>
        </form>
        <Drawer open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>¿Eliminar evento?</DrawerTitle>
              <DrawerDescription>Esta acción no se puede deshacer.</DrawerDescription>
            </DrawerHeader>
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
      </DrawerContent>
    </Drawer>
  )
}

function toDefaultValues(event: EventResponse['event'] | null): FormValues {
  const start = event ? new Date(event.eventDateStart) : new Date()
  const end = event ? new Date(event.eventDateEnd) : new Date(start)

  if (!event) {
    end.setHours(end.getHours() + 1)
  }

  return {
    name: event?.name ?? '',
    description: event?.description ?? '',
    eventDateStart: start,
    eventDateEnd: end,
    priorityId: String(event?.priorityId ?? 2) as PriorityValue,
  }
}

function FormRow({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

function FieldError({ errors }: { errors: Array<unknown> }) {
  const message = errors.find((fieldError) => typeof fieldError === 'string')

  if (!message) {
    return null
  }

  return <p className="text-sm text-red-600">{message}</p>
}
