import { Switch as BaseSwitch } from '@base-ui-components/react/switch'
import * as React from 'react'

import { cn } from '@/lib/utils'

type SwitchProps = React.ComponentPropsWithoutRef<typeof BaseSwitch.Root>

export const Switch = React.forwardRef<React.ElementRef<typeof BaseSwitch.Root>, SwitchProps>(
  ({ className, ...props }, ref) => {
    return (
      <BaseSwitch.Root
        ref={ref}
        className={cn(
          'group inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-muted p-0.5 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'data-checked:bg-foreground data-disabled:cursor-not-allowed data-disabled:opacity-50',
          className,
        )}
        {...props}
      >
        <BaseSwitch.Thumb
          className={cn(
            'pointer-events-none block size-6 rounded-full bg-background shadow-none ring-0 transition-transform',
            'data-checked:translate-x-5',
          )}
        />
      </BaseSwitch.Root>
    )
  },
)

Switch.displayName = 'Switch'
