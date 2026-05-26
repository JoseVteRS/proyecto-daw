import { useForm } from '@tanstack/react-form'
import { Plus } from 'lucide-react'
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
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createEvent } from '@/modules/calendar/server/api'

type PriorityValue = '1' | '2' | '3'

type FormValues = {
  name: string
  description: string
  eventDateStart: Date
  eventDateEnd: Date
  priorityId: PriorityValue
}

type CreateEventDrawerProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  initialStart?: Date
  showTrigger?: boolean
}

const defaultRange = (startInput?: Date): { start: Date; end: Date } => {
  const start = startInput ? new Date(startInput) : new Date()
  if (!startInput) {
    start.setMinutes(0, 0, 0)
    start.setHours(start.getHours() + 1)
  }
  const end = new Date(start)
  end.setHours(end.getHours() + 1)
  return { start, end }
}

export function CreateEventDrawer({ open, onOpenChange, initialStart, showTrigger = true }: CreateEventDrawerProps) {
  const isControlled = typeof open === 'boolean'
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = isControlled ? (open as boolean) : internalOpen
  const [error, setError] = useState<string | null>(null)
  const initialRange = useMemo(() => defaultRange(initialStart), [initialStart])

  const defaultValues: FormValues = {
    name: '',
    description: '',
    eventDateStart: initialRange.start,
    eventDateEnd: initialRange.end,
    priorityId: '2',
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      setError(null)
      try {
        await createEvent({
          name: value.name,
          description: value.description.trim() ? value.description.trim() : undefined,
          eventDateStart: value.eventDateStart.toISOString(),
          eventDateEnd: value.eventDateEnd.toISOString(),
          priorityId: Number(value.priorityId),
        })
        formApi.reset()
        handleOpenChange(false)
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Ha ocurrido un error inesperado.')
      }
    },
  })

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (!initialStart) {
      return
    }

    const range = defaultRange(initialStart)
    form.reset({
      name: '',
      description: '',
      eventDateStart: range.start,
      eventDateEnd: range.end,
      priorityId: '2',
    })
  }, [form, initialStart, isOpen])

  function handleOpenChange(nextOpen: boolean) {
    if (!isControlled) {
      setInternalOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
    if (!nextOpen) {
      setError(null)
    }
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      {showTrigger ? (
        <DrawerTrigger
          render={
            <Button
              aria-label="Crear evento"
              className="fixed right-5 bottom-20 z-30 size-14 rounded-full shadow-lg"
              size="icon"
              variant="default"
            >
              <Plus className="size-5" />
            </Button>
          }
        />
      ) : null}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Nuevo evento</DrawerTitle>
          <DrawerDescription>Añade un evento a tu agenda.</DrawerDescription>
        </DrawerHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
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
                  onChange={(event) => field.handleChange(event.target.value)}
                  required
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
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Opcional"
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
                  onChange={(event) => field.handleChange(event.target.value as PriorityValue)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" variant="accent" disabled={isSubmitting}>
                  {isSubmitting ? 'Creando...' : 'Crear evento'}
                </Button>
              )}
            </form.Subscribe>
            <DrawerClose
              render={
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              }
            />
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
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
