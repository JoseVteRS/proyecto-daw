import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { addMonths, formatDateEs, formatMonthYearEs, getMonthGrid, isSameDay, setTime, startOfMonth } from '@/lib/date'

export type DatePickerProps = {
  id?: string
  value: Date | null
  onChange: (next: Date | null) => void
  min?: Date
  max?: Date
  placeholder?: string
  disabled?: boolean
  className?: string
}

const weekdayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export function DatePicker({
  id,
  value,
  onChange,
  min,
  max,
  placeholder = 'Seleccionar fecha',
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState<Date>(value ?? new Date())

  const monthGrid = useMemo(() => getMonthGrid(viewDate), [viewDate])
  const currentMonthStart = startOfMonth(viewDate)

  const selectDate = (nextDate: Date) => {
    const nextValue = value ? setTime(nextDate, value.getHours(), value.getMinutes()) : setTime(nextDate, 0, 0)
    onChange(nextValue)
    setOpen(false)
    setViewDate(nextDate)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (nextOpen && value) {
          setViewDate(value)
        }
      }}
    >
      <DrawerTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn('h-10 w-full justify-start gap-2 text-left font-normal', className)}
          disabled={disabled}
        >
          <CalendarDays className="size-4 shrink-0" />
          <span className="truncate">{value ? formatDateEs(value) : placeholder}</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Selecciona fecha</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-3 px-5 pb-5">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Mes anterior"
              className="size-10"
              onClick={() => setViewDate((current) => addMonths(current, -1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <p className="text-sm font-medium capitalize">{formatMonthYearEs(currentMonthStart)}</p>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Mes siguiente"
              className="size-10"
              onClick={() => setViewDate((current) => addMonths(current, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {weekdayLabels.map((label) => (
              <div key={label} className="flex size-10 items-center justify-center">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthGrid.flat().map((day) => {
              const isSelected = Boolean(value && isSameDay(day.date, value))
              const isDisabled = (min && startOfDay(day.date) < startOfDay(min)) || (max && startOfDay(day.date) > startOfDay(max))

              return (
                <button
                  key={day.date.toISOString()}
                  type="button"
                  disabled={Boolean(isDisabled)}
                  className={cn(
                    'flex size-10 items-center justify-center rounded-md text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    !day.inCurrentMonth && 'opacity-40',
                    isDisabled && 'pointer-events-none opacity-30',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground',
                  )}
                  onClick={() => selectDate(day.date)}
                >
                  {day.date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}
