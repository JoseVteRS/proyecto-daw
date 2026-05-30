import { DatePicker } from '@/components/date-picker'
import { FormAlert, FormField } from '@/components/form-field'
import { TimeSelect } from '@/components/time-select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DrawerFooter } from '@/components/ui/drawer'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { setTime } from '@/lib/date'
import type { useCreateEventDrawer } from '@/modules/calendar/hooks/use-create-event-drawer'
import {
  applyAllDayToggle,
  applyEndDateChange,
  applyMultiDayToggle,
  applyStartDateChange,
  applyStartTimeChange,
} from '@/modules/calendar/lib/event-date-utils'
import {
  eventDateEndValidator,
  eventDateStartValidator,
  eventDescriptionValidator,
  eventNameValidator,
  priorityOptions,
  type PriorityValue,
} from '@/modules/calendar/lib/event-form-types'

type CreateEventFormProps = {
  form: ReturnType<typeof useCreateEventDrawer>['form']
  allDay: boolean
  setAllDay: (value: boolean) => void
  isMultiDay: boolean
  setIsMultiDay: (value: boolean) => void
  error: string | null
  isPending: boolean
  startDateLabel: string
}

export function CreateEventForm({
  form,
  allDay,
  setAllDay,
  isMultiDay,
  setIsMultiDay,
  error,
  isPending,
  startDateLabel,
}: CreateEventFormProps) {
  const schedulingContext = () => ({
    currentStart: form.state.values.eventDateStart,
    currentEnd: form.state.values.eventDateEnd,
    allDay,
    isMultiDay,
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
      className="flex flex-col gap-5 overflow-y-auto px-5 pt-2 pb-4"
    >
      <form.Field name="name" validators={{ onChange: eventNameValidator }}>
        {(field) => (
          <FormField
            label="Título del evento"
            htmlFor={field.name}
            hideLabel
            errors={field.state.meta.errors}
          >
            <Input
              id={field.name}
              name={field.name}
              maxLength={150}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              className="h-auto border-0 px-0 text-4xl font-semibold text-foreground shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0 bg-transparent"
              placeholder="Añadir título"
              required
            />
          </FormField>
        )}
      </form.Field>

      <form.Field
        name="description"
        validators={{ onChange: eventDescriptionValidator }}
      >
        {(field) => (
          <FormField
            label="Descripción del evento"
            htmlFor={field.name}
            hideLabel
            errors={field.state.meta.errors}
          >
            <Textarea
              id={field.name}
              name={field.name}
              maxLength={2000}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="Añadir descripción"
              className="min-h-0 border-0 px-0 text-sm text-muted-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0 bg-transparent"
            />
          </FormField>
        )}
      </form.Field>

      <form.Field
        name="eventDateStart"
        validators={{ onChange: eventDateStartValidator }}
      >
        {(field) => (
          <FormField label="Fecha" hideLabel errors={field.state.meta.errors}>
            <div className="rounded-md border border-border p-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-base font-semibold text-foreground">Fecha</p>
                <DatePicker
                  id={`${field.name}-date-start`}
                  value={field.state.value}
                  onChange={(next) => {
                    const { start, end } = applyStartDateChange(
                      next ?? new Date(),
                      schedulingContext(),
                    )
                    form.setFieldValue('eventDateStart', start)
                    form.setFieldValue('eventDateEnd', end)
                  }}
                  className="h-auto border-0 bg-transparent p-0 text-sm font-semibold text-muted-foreground shadow-none hover:bg-transparent focus-visible:ring-0 [&>svg]:hidden"
                  placeholder={startDateLabel}
                />
              </div>
            </div>
          </FormField>
        )}
      </form.Field>

      <div>
        <Field
          orientation="horizontal"
          className=""
        >
          <FieldLabel className="text-base font-semibold">
            Todo el día
          </FieldLabel>
          <Checkbox
            checked={allDay}
            onCheckedChange={(checked) => {
              const nextAllDay = checked === true
              setAllDay(nextAllDay)
              const { start, end } = applyAllDayToggle(
                nextAllDay,
                schedulingContext(),
              )
              form.setFieldValue('eventDateStart', start)
              form.setFieldValue('eventDateEnd', end)
            }}
            aria-label="Todo el día"
          />
        </Field>
      </div>

      {!allDay ? (
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <form.Field
                name="eventDateStart"
                validators={{ onChange: eventDateStartValidator }}
              >
                {(field) => (
                  <FormField
                    label="Hora de inicio"
                    hideLabel
                    errors={field.state.meta.errors}
                  >
                    <TimeSelect
                      id={`${field.name}-time-start`}
                      value={field.state.value}
                      ariaLabel="Hora de inicio"
                      onChange={(next) => {
                        const { start, end } = applyStartTimeChange(
                          next ?? new Date(),
                          schedulingContext(),
                        )
                        field.handleChange(start)
                        form.setFieldValue('eventDateEnd', end)
                      }}
                    />
                  </FormField>
                )}
              </form.Field>
            </div>

            <span className="pt-2 text-base font-semibold text-muted-foreground">
              -
            </span>

            <div className="min-w-0 flex-1">
              <form.Field
                name="eventDateEnd"
                validators={{
                  onChangeListenTo: ['eventDateStart'],
                  onChange: eventDateEndValidator,
                }}
              >
                {(field) => (
                  <FormField
                    label="Hora de fin"
                    hideLabel
                    errors={field.state.meta.errors}
                  >
                    <TimeSelect
                      id={`${field.name}-time-end`}
                      value={field.state.value}
                      ariaLabel="Hora de fin"
                      onChange={(next) => {
                        const pickedTime = next ?? new Date()
                        field.handleChange(
                          setTime(
                            field.state.value,
                            pickedTime.getHours(),
                            pickedTime.getMinutes(),
                          ),
                        )
                      }}
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
            <FieldLabel className="text-xs font-semibold tracking-wide text-muted-foreground">
              IMPORTANCIA
            </FieldLabel>
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
                  className="rounded-full border-0 px-4 py-2 text-sm font-semibold data-checked:bg-foreground data-checked:text-background"
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
          disabled={isPending}
        >
          {isPending ? 'Creando...' : 'Crear evento'}
        </Button>
      </DrawerFooter>
    </form>
  )
}
