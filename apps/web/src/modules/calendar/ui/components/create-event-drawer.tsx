import { useForm } from '@tanstack/react-form'
import { Plus, X } from 'lucide-react'
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
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { addDays, formatWeekdayDateEs, setTime } from '@/lib/date'
import { cn } from '@/lib/utils'
import { useCreateEventMutation } from '@/modules/calendar/queries/use-create-event-mutation'

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

const priorityOptions: Array<{ value: PriorityValue; label: string }> = [
  { value: '1', label: 'Baja' },
  { value: '2', label: 'Media' },
  { value: '3', label: 'Alta' },
]

function toAllDayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)

  const end = new Date(date)
  end.setHours(23, 59, 0, 0)

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

export function CreateEventDrawer({ open, onOpenChange, initialStart, showTrigger = true }: CreateEventDrawerProps) {
  const defaultAllDay = true
  const defaultMultiDay = false
  const isControlled = typeof open === 'boolean'
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = isControlled ? (open as boolean) : internalOpen
  const [allDay, setAllDay] = useState(defaultAllDay)
  const [isMultiDay, setIsMultiDay] = useState(defaultMultiDay)
  const [error, setError] = useState<string | null>(null)
  const createEventMutation = useCreateEventMutation()
  const initialRange = useMemo(() => defaultRange(initialStart), [initialStart])
  const initialAllDayRange = useMemo(() => toAllDayRange(initialRange.start), [initialRange.start])

  const defaultValues: FormValues = {
    name: '',
    description: '',
    eventDateStart: initialAllDayRange.start,
    eventDateEnd: initialAllDayRange.end,
    priorityId: '2',
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      setError(null)
      try {
        await createEventMutation.mutateAsync({
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

    const range = toAllDayRange(initialStart)
    setAllDay(defaultAllDay)
    setIsMultiDay(defaultMultiDay)
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
      setAllDay(defaultAllDay)
      setIsMultiDay(defaultMultiDay)
    }
  }

  const startDateLabel = formatWeekdayDateEs(form.state.values.eventDateStart)

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
              className="fixed right-5 bottom-20 z-30 size-12 rounded-mc shadow-lg"
              size="icon"
              variant="default"
            >
              <Plus className="size-5" />
            </Button>
          }
        />
      ) : null}
      <DrawerContent>
        <DrawerHeader className="flex-row items-center justify-between gap-2 pb-3">
          <DrawerTitle>Nuevo evento</DrawerTitle>
          <DrawerClose
            render={
              <Button type="button" variant="ghost" size="icon" aria-label="Cerrar formulario">
                <X className="size-4" />
              </Button>
            }
          />
        </DrawerHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
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
                  onChange={(event) => field.handleChange(event.target.value)}
                  className="h-auto border-0 px-0 text-4xl font-semibold text-foreground shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
                  placeholder="Añadir título"
                  aria-label="Título del evento"
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
                <Input
                  id={field.name}
                  name={field.name}
                  maxLength={2000}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Añadir descripción"
                  className="h-auto border-0 px-0 text-sm text-muted-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                  aria-label="Descripción del evento"
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

                  if (nextAllDay) {
                    const currentStart = form.state.values.eventDateStart
                    const currentEnd = form.state.values.eventDateEnd
                    const nextStart = new Date(currentStart)
                    nextStart.setHours(0, 0, 0, 0)

                    const nextEnd = isMultiDay ? addDays(nextStart, getDayDelta(currentStart, currentEnd)) : new Date(nextStart)
                    nextEnd.setHours(23, 59, 0, 0)

                    form.setFieldValue('eventDateStart', nextStart)
                    form.setFieldValue('eventDateEnd', nextEnd)
                    return
                  }

                  const nextStart = setTime(form.state.values.eventDateStart, 9, 0)
                  form.setFieldValue('eventDateStart', nextStart)
                  form.setFieldValue('eventDateEnd', clampEndSameDay(nextStart))
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
                      placeholder={startDateLabel}
                    />
                  </div>
                  <div className="mt-2 border-t border-border/50 pt-2">
                    <button
                      type="button"
                      className="text-sm font-semibold text-muted-foreground"
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
                            if (nextEnd.getTime() < currentStart.getTime()) {
                              return
                            }
                            form.setFieldValue('eventDateEnd', nextEnd)
                            return
                          }

                          const nextEnd = setTime(selectedDate, currentEnd.getHours(), currentEnd.getMinutes())
                          form.setFieldValue('eventDateEnd', nextEnd.getTime() > currentStart.getTime() ? nextEnd : clampEndSameDay(currentStart))
                        }}
                        className="h-10 justify-start text-sm font-medium shadow-none"
                        placeholder="Fecha fin"
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
                        const nextStart = setTime(
                          field.state.value,
                          pickedTime.getHours(),
                          pickedTime.getMinutes(),
                        )
                        field.handleChange(nextStart)
                        if (!isMultiDay) {
                          form.setFieldValue('eventDateEnd', clampEndSameDay(nextStart))
                          return
                        }
                        if (form.state.values.eventDateEnd.getTime() <= nextStart.getTime()) {
                          form.setFieldValue('eventDateEnd', clampEndSameDay(nextStart))
                        }
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
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground">FIN</p>
                    <TimePicker
                      id={`${field.name}-time-end`}
                      value={field.state.value}
                      onChange={(next) => {
                        const pickedTime = next ?? new Date()
                        const nextEnd = setTime(field.state.value, pickedTime.getHours(), pickedTime.getMinutes())
                        field.handleChange(nextEnd)
                      }}
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
                        className={cn(
                          'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                          isSelected
                            ? 'bg-foreground text-background shadow-none'
                            : 'text-foreground hover:bg-background/70',
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
            <Button type="submit" variant="accent" className="h-12 rounded-md text-base font-semibold" disabled={createEventMutation.isPending}>
              {createEventMutation.isPending ? 'Creando...' : 'Crear evento'}
            </Button>
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
