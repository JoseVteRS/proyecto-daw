import { addDays, setTime } from '@/lib/date'

export function defaultEventRange(startInput?: Date): { start: Date; end: Date } {
  const start = startInput ? new Date(startInput) : new Date()
  if (!startInput) {
    start.setMinutes(0, 0, 0)
    start.setHours(start.getHours() + 1)
  }
  const end = new Date(start)
  end.setHours(end.getHours() + 1)
  return { start, end }
}

export function toAllDayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)

  const end = new Date(date)
  end.setHours(23, 59, 0, 0)

  return { start, end }
}

export function clampEndSameDay(start: Date): Date {
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

export function getDayDelta(start: Date, end: Date): number {
  const diff = startOfDayTimestamp(end) - startOfDayTimestamp(start)
  return Math.max(0, Math.round(diff / (24 * 60 * 60 * 1000)))
}

type DateRange = { start: Date; end: Date }

type SchedulingContext = {
  currentStart: Date
  currentEnd: Date
  allDay: boolean
  isMultiDay: boolean
}

export function applyStartDateChange(selectedDate: Date, context: SchedulingContext): DateRange {
  const { currentStart, currentEnd, allDay, isMultiDay } = context
  const dayDelta = getDayDelta(currentStart, currentEnd)

  if (allDay) {
    const nextStart = new Date(selectedDate)
    nextStart.setHours(0, 0, 0, 0)
    const nextEnd = isMultiDay ? addDays(nextStart, dayDelta) : new Date(nextStart)
    nextEnd.setHours(23, 59, 0, 0)
    return { start: nextStart, end: nextEnd }
  }

  const nextStart = setTime(selectedDate, currentStart.getHours(), currentStart.getMinutes())

  if (!isMultiDay) {
    return { start: nextStart, end: clampEndSameDay(nextStart) }
  }

  const nextEndDate = addDays(selectedDate, dayDelta)
  const nextEnd = setTime(nextEndDate, currentEnd.getHours(), currentEnd.getMinutes())

  return {
    start: nextStart,
    end: nextEnd.getTime() > nextStart.getTime() ? nextEnd : clampEndSameDay(nextStart),
  }
}

export function applyEndDateChange(selectedDate: Date, context: SchedulingContext): Date | null {
  const { currentStart, currentEnd, allDay } = context

  if (allDay) {
    const nextEnd = new Date(selectedDate)
    nextEnd.setHours(23, 59, 0, 0)
    if (nextEnd.getTime() < currentStart.getTime()) {
      return null
    }
    return nextEnd
  }

  const nextEnd = setTime(selectedDate, currentEnd.getHours(), currentEnd.getMinutes())
  return nextEnd.getTime() > currentStart.getTime() ? nextEnd : clampEndSameDay(currentStart)
}

export function applyAllDayToggle(nextAllDay: boolean, context: SchedulingContext): DateRange {
  const { currentStart, currentEnd, isMultiDay } = context

  if (nextAllDay) {
    const nextStart = new Date(currentStart)
    nextStart.setHours(0, 0, 0, 0)
    const nextEnd = isMultiDay ? addDays(nextStart, getDayDelta(currentStart, currentEnd)) : new Date(nextStart)
    nextEnd.setHours(23, 59, 0, 0)
    return { start: nextStart, end: nextEnd }
  }

  const nextStart = setTime(currentStart, 9, 0)
  return { start: nextStart, end: clampEndSameDay(nextStart) }
}

export function applyMultiDayToggle(nextMultiDay: boolean, context: SchedulingContext): Date | null {
  if (nextMultiDay) {
    return null
  }

  const { currentStart, allDay } = context
  return allDay ? toAllDayRange(currentStart).end : clampEndSameDay(currentStart)
}

export function applyStartTimeChange(pickedTime: Date, context: SchedulingContext): DateRange {
  const { currentStart, currentEnd, isMultiDay } = context
  const nextStart = setTime(currentStart, pickedTime.getHours(), pickedTime.getMinutes())

  if (!isMultiDay) {
    return { start: nextStart, end: clampEndSameDay(nextStart) }
  }

  if (currentEnd.getTime() <= nextStart.getTime()) {
    return { start: nextStart, end: clampEndSameDay(nextStart) }
  }

  return { start: nextStart, end: currentEnd }
}
