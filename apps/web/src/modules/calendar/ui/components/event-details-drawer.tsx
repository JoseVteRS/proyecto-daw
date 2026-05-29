import type { EventResponse } from '@proyecto-daw/shared'
import { useForm } from '@tanstack/react-form'
import { Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { DatePicker } from '@/components/date-picker'
import { TimePicker } from '@/components/time-picker'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { addDays, formatWeekdayDateEs, setTime } from '@/lib/date'
import { cn } from '@/lib/utils'
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

const priorityOptions: Array<{ value: PriorityValue; label: string }> = [
  { value: '1', label: 'Baja' },
  { value: '2', label: 'Media' },
  { value: '3', label: 'Alta' },
]

function toAllDayRange(startDate: Date, endDate?: Date): { start: Date; end: Date } {
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)

  const end = new Date(endDate ?? startDate)
  end.setHours(23, 59, 0, 0)

  if (end.getTime() < start.getTime()) {
    return { start, end: new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 0, 0) }
  }

  return { start, end }
}

function clampEndSameDay(start: Date): Date {
  const end = new Date(start)
  end.setHours(start.getHours() + 1, start.getMinutes(), 0, 0)

  if (
    end.getFullYear() !== start.getFullYear() ||
    end.getMonth() !== start.getMonth() ||
    end.getDate() !== start.getDate()
  ) {
    return new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 0, 0)
  }

  return end
}

function startOfDayTimestamp(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function getDayDelta(start: Date, end: Date): number {
  const diff = startOfDayTimestamp(end) - startOfDayTimestamp(start)
  return Math.max(0, Math.round(diff / (24 * 60 * 60 * 1000)))
}

function isAllDayEvent(start: Date, end: Date): boolean {
  return start.getHours() === 0 && start.getMinutes() === 0 && end.getHours() === 23 && end.getMinutes() === 59
}

export function EventDetailsDrawer({ open, onOpenChange, event }: EventDetailsDrawerProps) {
  const [allDay, setAllDay] = useState(false)
  const [isMultiDay, setIsMultiDay] = useState(false)
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

    const values = toDefaultValues(event)
    form.reset(values)
    setAllDay(isAllDayEvent(values.eventDateStart, values.eventDateEnd))
    setIsMultiDay(startOfDayTimestamp(values.eventDateEnd) > startOfDayTimestamp(values.eventDateStart))
    setError(null)
    setConfirmDelete(false)
  }, [event, form, open])

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setError(null)
      setConfirmDelete(false)
      setAllDay(false)
      setIsMultiDay(false)
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
        <DrawerHeader className="flex-row items-center justify-between gap-2 pb-3">
          <DrawerTitle>Editar evento</DrawerTitle>
          <div className="flex items-center gap-1">
            <DrawerClose
              render={
                <Button type="button" variant="ghost" size="icon" aria-label="Cerrar formulario">
                  <X className="size-4" />
                </Button>
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-red-600 hover:bg-red-100 hover:text-red-700"
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
          className="flex flex-col gap-5 overflow-y-auto px-5 pt-2 pb-4"
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
                <Input
                  id={field.name}
                  name={field.name}
                  maxLength={150}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(changeEvent) => field.handleChange(changeEvent.target.value)}
                  className="h-auto border-0 px-0 text-4xl font-semibold text-foreground shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
                  placeholder="Añadir título"
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
                <Input
                  id={field.name}
                  name={field.name}
                  maxLength={2000}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(changeEvent) => field.handleChange(changeEvent.target.value)}
                  placeholder="Añadir descripción"
                  className="h-auto border-0 px-0 text-sm text-muted-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                  disabled={!event}
                />
                <FieldError errors={field.state.meta.errors} />
              </FormRow>
            )}
          </form.Field>

          <Card className="rounded-2xl border-0 bg-muted/40 px-4 py-3 shadow-none">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">Todo el día</p>
                <p className="text-sm text-muted-foreground">Sin horario específico</p>
              </div>
              <Switch
                checked={allDay}
                className="h-6 w-10 [&_span]:size-5 [&_span]:data-checked:translate-x-4"
                onCheckedChange={(checked) => {
                  const nextAllDay = Boolean(checked)
                  setAllDay(nextAllDay)
                  const currentStart = form.state.values.eventDateStart
                  const currentEnd = form.state.values.eventDateEnd

                  if (nextAllDay) {
                    const range = toAllDayRange(currentStart, currentEnd)
                    form.setFieldValue('eventDateStart', range.start)
                    form.setFieldValue('eventDateEnd', range.end)
                    return
                  }

                  const nextStart = setTime(currentStart, 9, 0)
                  form.setFieldValue('eventDateStart', nextStart)
                  form.setFieldValue(
                    'eventDateEnd',
                    isMultiDay
                      ? setTime(addDays(nextStart, getDayDelta(currentStart, currentEnd)), 10, 0)
                      : clampEndSameDay(nextStart),
                  )
                }}
                aria-label="Todo el día"
              />
            </div>
          </Card>

          <form.Field
            name="eventDateStart"
            validators={{
              onChange: ({ value }) => (!value ? 'Fecha de inicio obligatoria.' : undefined),
            }}
          >
            {(field) => (
              <FormRow>
                <Card className="rounded-2xl border-0 bg-muted/40 px-4 py-3 shadow-none">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-semibold text-foreground">Fecha</p>
                    <DatePicker
                      id={`${field.name}-date-start`}
                      value={field.state.value}
                      onChange={(next) => {
                        const selectedDate = next ?? new Date()
                        const currentStart = form.state.values.eventDateStart
                        const currentEnd = form.state.values.eventDateEnd
                        const dayDelta = getDayDelta(currentStart, currentEnd)

                        if (allDay) {
                          const nextStart = new Date(selectedDate)
                          nextStart.setHours(0, 0, 0, 0)
                          const nextEnd = isMultiDay ? addDays(nextStart, dayDelta) : new Date(nextStart)
                          nextEnd.setHours(23, 59, 0, 0)
                          form.setFieldValue('eventDateStart', nextStart)
                          form.setFieldValue('eventDateEnd', nextEnd)
                          return
                        }

                        const nextStart = setTime(selectedDate, currentStart.getHours(), currentStart.getMinutes())
                        if (!isMultiDay) {
                          form.setFieldValue('eventDateStart', nextStart)
                          form.setFieldValue('eventDateEnd', clampEndSameDay(nextStart))
                          return
                        }

                        const nextEndDate = addDays(selectedDate, dayDelta)
                        const nextEnd = setTime(nextEndDate, currentEnd.getHours(), currentEnd.getMinutes())

                        form.setFieldValue('eventDateStart', nextStart)
                        form.setFieldValue('eventDateEnd', nextEnd.getTime() > nextStart.getTime() ? nextEnd : clampEndSameDay(nextStart))
                      }}
                      className="h-auto border-0 bg-transparent p-0 text-sm font-semibold text-muted-foreground shadow-none hover:bg-transparent focus-visible:ring-0 [&>svg]:hidden"
                      placeholder={formatWeekdayDateEs(field.state.value)}
                      disabled={!event}
                    />
                  </div>
                  <div className="mt-2 border-t border-border/50 pt-2">
                    <button
                      type="button"
                      className="text-sm font-semibold text-muted-foreground disabled:opacity-50"
                      disabled={!event}
                      onClick={() => {
                        const nextMultiDay = !isMultiDay
                        setIsMultiDay(nextMultiDay)
                        if (!nextMultiDay) {
                          const nextStart = form.state.values.eventDateStart
                          form.setFieldValue(
                            'eventDateEnd',
                            allDay ? toAllDayRange(nextStart).end : clampEndSameDay(nextStart),
                          )
                        }
                      }}
                    >
                      {isMultiDay ? '- Quitar multi-día' : '+ Hacer multi-día'}
                    </button>
                  </div>
                  {isMultiDay ? (
                    <div className="mt-3">
                      <DatePicker
                        id={`${field.name}-date-end`}
                        value={form.state.values.eventDateEnd}
                        min={field.state.value}
                        onChange={(next) => {
                          const selectedDate = next ?? new Date()
                          const currentStart = form.state.values.eventDateStart
                          const currentEnd = form.state.values.eventDateEnd

                          if (allDay) {
                            const nextEnd = new Date(selectedDate)
                            nextEnd.setHours(23, 59, 0, 0)
                            if (nextEnd.getTime() < currentStart.getTime()) return
                            form.setFieldValue('eventDateEnd', nextEnd)
                            return
                          }

                          const nextEnd = setTime(selectedDate, currentEnd.getHours(), currentEnd.getMinutes())
                          form.setFieldValue('eventDateEnd', nextEnd.getTime() > currentStart.getTime() ? nextEnd : clampEndSameDay(currentStart))
                        }}
                        className="h-10 justify-start text-sm font-medium shadow-none"
                        placeholder="Fecha fin"
                        disabled={!event}
                      />
                    </div>
                  ) : null}
                </Card>
                <FieldError errors={field.state.meta.errors} />
              </FormRow>
            )}
          </form.Field>

          {!allDay ? (
            <div className="grid grid-cols-2 gap-3">
              <form.Field
                name="eventDateStart"
                validators={{
                  onChange: ({ value }) => (!value ? 'Fecha de inicio obligatoria.' : undefined),
                }}
              >
                {(field) => (
                  <FormRow>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground">INICIO</p>
                    <TimePicker
                      id={`${field.name}-time-start`}
                      value={field.state.value}
                      onChange={(next) => {
                        const pickedTime = next ?? new Date()
                        const nextStart = setTime(field.state.value, pickedTime.getHours(), pickedTime.getMinutes())
                        field.handleChange(nextStart)
                        if (!isMultiDay) {
                          form.setFieldValue('eventDateEnd', clampEndSameDay(nextStart))
                          return
                        }
                        if (form.state.values.eventDateEnd.getTime() <= nextStart.getTime()) {
                          form.setFieldValue('eventDateEnd', clampEndSameDay(nextStart))
                        }
                      }}
                      disabled={!event}
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
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground">FIN</p>
                    <TimePicker
                      id={`${field.name}-time-end`}
                      value={field.state.value}
                      onChange={(next) => {
                        const pickedTime = next ?? new Date()
                        const nextEnd = setTime(field.state.value, pickedTime.getHours(), pickedTime.getMinutes())
                        field.handleChange(nextEnd)
                      }}
                      disabled={!event}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </FormRow>
                )}
              </form.Field>
            </div>
          ) : null}

          <form.Field name="priorityId">
            {(field) => (
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground">IMPORTANCIA</p>
                <div className="inline-flex rounded-full bg-muted/70 p-1 shadow-none">
                  {priorityOptions.map((option) => {
                    const isSelected = field.state.value === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onBlur={field.handleBlur}
                        onClick={() => field.handleChange(option.value)}
                        disabled={!event}
                        className={cn(
                          'rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50',
                          isSelected ? 'bg-foreground text-background shadow-none' : 'text-foreground hover:bg-background/70',
                        )}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
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

          <DrawerFooter className="px-0 pt-1 pb-0">
            <Button
              type="submit"
              variant="accent"
              className="h-12 rounded-md text-base font-semibold"
              disabled={!event || updateEventMutation.isPending || deleteEventMutation.isPending}
            >
              {updateEventMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DrawerFooter>
        </form>
        <Drawer open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>¿Eliminar evento?</DrawerTitle>
              <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
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
