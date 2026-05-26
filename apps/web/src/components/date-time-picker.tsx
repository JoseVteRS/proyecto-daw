import { type DatePickerProps, DatePicker } from '@/components/date-picker'
import { TimePicker } from '@/components/time-picker'
import { cn } from '@/lib/utils'

type DateTimePickerProps = DatePickerProps

export function DateTimePicker({ className, value, onChange, ...props }: DateTimePickerProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      <DatePicker className="flex-1" value={value} onChange={onChange} {...props} />
      <TimePicker value={value} onChange={onChange} />
    </div>
  )
}
