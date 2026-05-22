const DAYS_IN_WEEK = 7
const WEEKS_IN_MONTH_GRID = 6

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function getMondayIndex(day: number) {
  return day === 0 ? 6 : day - 1
}

function getStartOfCalendarGrid(date: Date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const offset = getMondayIndex(firstDayOfMonth.getDay())
  return addDays(firstDayOfMonth, -offset)
}

export function buildMonthMatrix(date: Date) {
  const matrix: Array<Array<Date>> = []
  const startDate = getStartOfCalendarGrid(date)

  for (let weekIndex = 0; weekIndex < WEEKS_IN_MONTH_GRID; weekIndex += 1) {
    const week: Array<Date> = []

    for (let dayIndex = 0; dayIndex < DAYS_IN_WEEK; dayIndex += 1) {
      week.push(addDays(startDate, weekIndex * DAYS_IN_WEEK + dayIndex))
    }

    matrix.push(week)
  }

  return matrix
}

export function isSameDay(firstDate: Date, secondDate: Date) {
  const first = startOfDay(firstDate)
  const second = startOfDay(secondDate)

  return first.getTime() === second.getTime()
}

export function isToday(date: Date) {
  return isSameDay(date, new Date())
}
