export type MonthGridDay = {
  date: Date
  inCurrentMonth: boolean
}

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const monthFormatter = new Intl.DateTimeFormat('es-ES', {
  month: 'long',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export function addDays(date: Date, amount: number): Date {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + amount)
  return nextDate
}

export function getMonthGrid(viewDate: Date): Array<Array<MonthGridDay>> {
  const monthStart = startOfMonth(viewDate)
  const weekday = monthStart.getDay()
  const mondayFirstOffset = (weekday + 6) % 7
  const gridStart = addDays(monthStart, -mondayFirstOffset)

  const rows: Array<Array<MonthGridDay>> = []
  let cursor = gridStart

  for (let rowIndex = 0; rowIndex < 6; rowIndex += 1) {
    const row: Array<MonthGridDay> = []
    for (let columnIndex = 0; columnIndex < 7; columnIndex += 1) {
      row.push({
        date: cursor,
        inCurrentMonth: cursor.getMonth() === viewDate.getMonth(),
      })
      cursor = addDays(cursor, 1)
    }
    rows.push(row)
  }

  return rows
}

export function formatDateEs(date: Date): string {
  return dateFormatter.format(date)
}

export function formatMonthYearEs(date: Date): string {
  return monthFormatter.format(date)
}

export function formatTime(date: Date): string {
  return timeFormatter.format(date)
}

export function setTime(date: Date, hours: number, minutes: number): Date {
  const nextDate = new Date(date)
  nextDate.setHours(hours, minutes, 0, 0)
  return nextDate
}

export function parseIsoSafe(value: string): Date | null {
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }
  return parsedDate
}

export function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}
