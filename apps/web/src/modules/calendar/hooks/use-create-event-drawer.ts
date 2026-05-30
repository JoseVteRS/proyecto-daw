import { useForm } from '@tanstack/react-form'
import { useEffect, useMemo, useState } from 'react'

import { formatWeekdayDateEs } from '@/lib/date'
import { defaultEventRange } from '@/modules/calendar/lib/event-date-utils'
import type { EventFormValues, PriorityValue } from '@/modules/calendar/lib/event-form-types'
import { useCreateEventMutation } from '@/modules/calendar/queries/use-create-event-mutation'

type UseCreateEventDrawerOptions = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  initialStart?: Date
}

const DEFAULT_ALL_DAY = false
const DEFAULT_MULTI_DAY = false

export function useCreateEventDrawer({ open, onOpenChange, initialStart }: UseCreateEventDrawerOptions) {
  const isControlled = typeof open === 'boolean'
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = isControlled ? (open as boolean) : internalOpen
  const [allDay, setAllDay] = useState(DEFAULT_ALL_DAY)
  const [isMultiDay, setIsMultiDay] = useState(DEFAULT_MULTI_DAY)
  const [error, setError] = useState<string | null>(null)
  const createEventMutation = useCreateEventMutation()
  const initialRange = useMemo(() => defaultEventRange(initialStart), [initialStart])

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      eventDateStart: initialRange.start,
      eventDateEnd: initialRange.end,
      priorityId: '2' as PriorityValue,
    } satisfies EventFormValues,
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
    if (!isOpen || !initialStart) {
      return
    }

    const range = defaultEventRange(initialStart)
    setAllDay(DEFAULT_ALL_DAY)
    setIsMultiDay(DEFAULT_MULTI_DAY)
    form.reset({
      name: '',
      description: '',
      eventDateStart: range.start,
      eventDateEnd: range.end,
      priorityId: '2' as PriorityValue,
    })
  }, [form, initialStart, isOpen])

  function handleOpenChange(nextOpen: boolean) {
    if (!isControlled) {
      setInternalOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
    if (!nextOpen) {
      setError(null)
      setAllDay(DEFAULT_ALL_DAY)
      setIsMultiDay(DEFAULT_MULTI_DAY)
    }
  }

  const startDateLabel = formatWeekdayDateEs(form.state.values.eventDateStart)

  return {
    form,
    isOpen,
    handleOpenChange,
    allDay,
    setAllDay,
    isMultiDay,
    setIsMultiDay,
    error,
    isPending: createEventMutation.isPending,
    startDateLabel,
  }
}
