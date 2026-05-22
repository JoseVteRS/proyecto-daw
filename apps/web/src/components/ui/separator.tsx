import { Separator as BaseSeparator } from '@base-ui-components/react'
import * as React from 'react'

import { cn } from '@/lib/utils'

export const Separator = React.forwardRef<
  React.ElementRef<typeof BaseSeparator>,
  React.ComponentPropsWithoutRef<typeof BaseSeparator>
>(({ className, orientation = 'horizontal', ...props }, ref) => (
  <BaseSeparator
    ref={ref}
    orientation={orientation}
    className={cn('shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px', className)}
    {...props}
  />
))
Separator.displayName = 'Separator'
