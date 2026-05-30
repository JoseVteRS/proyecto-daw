import { NumberField } from '@base-ui-components/react/number-field'
import { Clock, Minus, Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { formatTime, setTime } from '@/lib/date'
import { cn } from '@/lib/utils'

export type TimePickerProps = {
  id?: string
  value: Date | null
  onChange: (next: Date | null) => void
  min?: Date
  max?: Date
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TimePicker({
  id,
  value,
  onChange,
  placeholder = 'Hora',
  disabled = false,
  className,
}: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const currentValue = value ?? setTime(new Date(), 9, 0)
  const hours = currentValue.getHours()
  const minutes = currentValue.getMinutes()

  const applyTime = (nextHours: number, nextMinutes: number) => {
    const baseDate = value ?? new Date()
    onChange(setTime(baseDate, nextHours, nextMinutes))
  }

  const presetTimes = [
    { label: 'Ahora', date: new Date() },
    { label: '09:00', hours: 9, minutes: 0 },
    { label: '12:00', hours: 12, minutes: 0 },
    { label: '18:00', hours: 18, minutes: 0 },
  ] as const

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn('h-10 w-full justify-start gap-2 text-left font-normal', className)}
          disabled={disabled}
        >
          <Clock className="size-4 shrink-0" />
          <span className="truncate">{value ? formatTime(value) : placeholder}</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Selecciona hora</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-3 px-5 pb-3">
          <div className="flex items-center justify-center gap-3 text-3xl tabular-nums">
            <TimePart
              label="Horas"
              id={`${id ?? 'time'}-hours`}
              min={0}
              max={23}
              value={hours}
              onValueChange={(nextHours) => applyTime(nextHours, minutes)}
            />
            <span className="pb-1 text-muted-foreground">:</span>
            <TimePart
              label="Minutos"
              id={`${id ?? 'time'}-minutes`}
              min={0}
              max={59}
              step={1}
              minimumIntegerDigits={2}
              value={minutes}
              onValueChange={(nextMinutes) => applyTime(hours, nextMinutes)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {presetTimes.map((preset) => {
              const handlePreset = () => {
                if ('date' in preset) {
                  const now = preset.date
                  applyTime(now.getHours(), now.getMinutes())
                  setOpen(false)
                  return
                }
                applyTime(preset.hours, preset.minutes)
                setOpen(false)
              }

              return (
                <Button key={preset.label} type="button" variant="outline" className="h-11" onClick={handlePreset}>
                  {preset.label}
                </Button>
              )
            })}
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button type="button" variant="default">
              Listo
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

type TimePartProps = {
  id: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  minimumIntegerDigits?: number
  onValueChange: (value: number) => void
}

function TimePart({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  minimumIntegerDigits = 1,
  onValueChange,
}: TimePartProps) {
  return (
    <NumberField.Root
      id={id}
      className="flex items-center gap-1"
      value={value}
      min={min}
      max={max}
      step={step}
      format={{ minimumIntegerDigits, useGrouping: false }}
      onValueChange={(nextValue) => {
        if (typeof nextValue === 'number') {
          onValueChange(nextValue)
        }
      }}
    >
      <NumberField.Decrement
        type="button"
        aria-label={`Reducir ${label}`}
        className="flex size-11 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Minus className="size-4" />
      </NumberField.Decrement>

      <NumberField.Input
        aria-label={label}
        className="h-11 w-16 rounded-md border border-input bg-background text-center text-3xl font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      <NumberField.Increment
        type="button"
        aria-label={`Aumentar ${label}`}
        className="flex size-11 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Plus className="size-4" />
      </NumberField.Increment>
    </NumberField.Root>
  )
}
