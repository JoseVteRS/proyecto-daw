import type { EventResponse } from '@proyecto-daw/shared'
import { useForm } from '@tanstack/react-form'
import { Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { DatePicker } from '@/components/date-picker'
import { FormAlert, FormField } from '@/components/form-field'
import { TimeSelect } from '@/components/time-select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { addDays, formatWeekdayDateEs, setTime } from '@/lib/date'
import { useUpdateEventMutation } from '@/modules/calendar/queries/use-update-event-mutation'
import { DeleteEventDrawer } from '@/modules/calendar/ui/components/delete-event-drawer'

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

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader className="flex-row items-center justify-between gap-2 pb-3">
          <DrawerTitle>Editar evento</DrawerTitle>
          <div className="flex items-center gap-1">
            <DrawerClose asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="Cerrar formulario">
                <X className="size-4" />
              </Button>
            </DrawerClose>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-red-600 hover:bg-red-100 hover:text-red-700"
              onClick={() => setConfirmDelete(true)}
              aria-label="Eliminar evento"
              disabled={!event || updateEventMutation.isPending}
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
              <FormField label="Título del evento" htmlFor={field.name} hideLabel errors={field.state.meta.errors}>
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
              </FormField>
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
              <FormField label="Descripción del evento" htmlFor={field.name} hideLabel errors={field.state.meta.errors}>
                <Textarea
                  id={field.name}
                  name={field.name}
                  maxLength={2000}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(changeEvent) => field.handleChange(changeEvent.target.value)}
                  placeholder="Añadir descripción"
                  className="min-h-0 border-0 px-0 text-sm text-muted-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                  disabled={!event}
                />
              </FormField>
            )}
          </form.Field>

          <form.Field
            name="eventDateStart"
            validators={{
              onChange: ({ value }) => (!value ? 'Fecha de inicio obligatoria.' : undefined),
            }}
          >
            {(field) => (
              <FormField label="Fecha" hideLabel errors={field.state.meta.errors}>
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
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-sm font-semibold text-muted-foreground disabled:opacity-50"
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
                    </Button>
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
              </FormField>
            )}
          </form.Field>

          <Card className="rounded-2xl border-0 bg-muted/40 px-4 py-3 shadow-none">
            <Field orientation="horizontal" className="items-center justify-between">
              <FieldLabel className="text-base font-semibold">Todo el día</FieldLabel>
              <Checkbox
                checked={allDay}
                disabled={!event}
                onCheckedChange={(checked) => {
                  const nextAllDay = checked === true
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
            </Field>
          </Card>

          {!allDay ? (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <form.Field
                    name="eventDateStart"
                    validators={{
                      onChange: ({ value }) => (!value ? 'Fecha de inicio obligatoria.' : undefined),
                    }}
                  >
                    {(field) => (
                      <FormField label="Hora de inicio" hideLabel errors={field.state.meta.errors}>
                        <TimeSelect
                          id={`${field.name}-time-start`}
                          value={field.state.value}
                          ariaLabel="Hora de inicio"
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
                      </FormField>
                    )}
                  </form.Field>
                </div>

                <span className="pt-2 text-base font-semibold text-muted-foreground">-</span>

                <div className="min-w-0 flex-1">
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
                      <FormField label="Hora de fin" hideLabel errors={field.state.meta.errors}>
                        <TimeSelect
                          id={`${field.name}-time-end`}
                          value={field.state.value}
                          ariaLabel="Hora de fin"
                          onChange={(next) => {
                            const pickedTime = next ?? new Date()
                            const nextEnd = setTime(field.state.value, pickedTime.getHours(), pickedTime.getMinutes())
                            field.handleChange(nextEnd)
                          }}
                          disabled={!event}
                        />
                      </FormField>
                    )}
                  </form.Field>
                </div>
              </div>
            </div>
          ) : null}

          <form.Field name="priorityId">
            {(field) => (
              <Field>
                <FieldLabel className="text-xs font-semibold tracking-wide text-muted-foreground">IMPORTANCIA</FieldLabel>
                <ToggleGroup
                  value={[field.state.value]}
                  onValueChange={(values: string[]) => {
                    const next = values.at(0)
                    if (next) field.handleChange(next as PriorityValue)
                  }}
                  spacing={0}
                  className="inline-flex rounded-full bg-muted/70 p-1 shadow-none"
                >
                  {priorityOptions.map((option) => (
                    <ToggleGroupItem
                      key={option.value}
                      value={option.value}
                      onBlur={field.handleBlur}
                      disabled={!event}
                      className="rounded-full border-0 px-4 py-2 text-sm font-semibold data-checked:bg-foreground data-checked:text-background disabled:opacity-50"
                    >
                      {option.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>
            )}
          </form.Field>

          {error ? <FormAlert message={error} /> : null}

          <DrawerFooter className="px-0 pt-1 pb-0">
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="h-12 rounded-md text-base font-semibold"
              disabled={!event || updateEventMutation.isPending}
            >
              {updateEventMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DrawerFooter>
        </form>
        <DeleteEventDrawer
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          event={event}
          onDeleted={() => handleOpenChange(false)}
        />
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
