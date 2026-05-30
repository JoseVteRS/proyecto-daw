import { Select as SelectPrimitive } from '@base-ui/react/select'
import { Clock } from '@hugeicons/core-free-icons'
import { useMemo, useRef } from 'react'

import {
  Select,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatTime, setTime } from '@/lib/date'
import { cn } from '@/lib/utils'
import { HugeiconsIcon } from '@hugeicons/react'

export type TimeSelectProps = {
  id?: string
  value: Date | null
  onChange: (next: Date | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

type TimeOption = {
  value: string
  label: string
}

const quarterHourOptions: TimeOption[] = Array.from({ length: 96 }, (_, index) => {
  const minutesOfDay = index * 15
  const hours = Math.floor(minutesOfDay / 60)
  const minutes = minutesOfDay % 60
  const date = setTime(new Date(2000, 0, 1), hours, minutes)

  return {
    value: String(minutesOfDay),
    label: formatTime(date),
  }
})

const selectPopupClassName = cn(
  'relative isolate z-50 max-h-72 w-(--anchor-width) min-w-32 origin-(--transform-origin)',
  'overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground',
  'shadow-md ring-1 ring-foreground/10',
  'data-[side=bottom]:slide-in-from-top-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
  'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
)

export function TimeSelect({
  id,
  value,
  onChange,
  placeholder = 'Hora',
  disabled = false,
  className,
  ariaLabel,
}: TimeSelectProps) {
  const portalContainerRef = useRef<HTMLDivElement>(null)
  const selectedMinutes = value ? value.getHours() * 60 + value.getMinutes() : null

  const options = useMemo(() => {
    if (selectedMinutes === null || selectedMinutes % 15 === 0) {
      return quarterHourOptions
    }

    const customOption = {
      value: String(selectedMinutes),
      label: formatTime(setTime(new Date(2000, 0, 1), Math.floor(selectedMinutes / 60), selectedMinutes % 60)),
    }

    return [...quarterHourOptions, customOption].sort((left, right) => Number(left.value) - Number(right.value))
  }, [selectedMinutes])

  const items = useMemo(
    () => options.map((option) => ({ label: option.label, value: option.value })),
    [options],
  )

  return (
    <div ref={portalContainerRef} className="relative">
      <Select
        items={items}
        value={selectedMinutes === null ? null : String(selectedMinutes)}
        modal={false}
        onValueChange={(nextValue) => {
          if (nextValue === null) {
            onChange(null)
            return
          }

          const minutesOfDay = Number(nextValue)
          if (!Number.isFinite(minutesOfDay)) {
            return
          }

          const baseDate = value ?? new Date()
          const nextHours = Math.floor(minutesOfDay / 60)
          const nextMinutes = minutesOfDay % 60
          onChange(setTime(baseDate, nextHours, nextMinutes))
        }}
        disabled={disabled}
      >
        <SelectTrigger
          type="button"
          id={id}
          aria-label={ariaLabel}
          className={cn(
            'h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-none',
            'flex items-center justify-between gap-2 text-left',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <HugeiconsIcon icon={Clock} className="size-4 shrink-0 text-muted-foreground" />
            <SelectValue placeholder={placeholder} />
          </span>
        </SelectTrigger>

        <SelectPrimitive.Portal container={portalContainerRef}>
          <SelectPrimitive.Positioner
            side="bottom"
            align="start"
            sideOffset={8}
            alignItemWithTrigger={false}
            className="isolate z-[100]"
          >
            <SelectPrimitive.Popup data-slot="select-content" className={selectPopupClassName}>
              <SelectPrimitive.List>
                <SelectGroup>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectPrimitive.List>
            </SelectPrimitive.Popup>
          </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
      </Select>
    </div>
  )
}
