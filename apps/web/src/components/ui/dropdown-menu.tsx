import { Menu as BaseMenu } from '@base-ui-components/react/menu'
import * as React from 'react'

import { cn } from '@/lib/utils'

export const DropdownMenu = BaseMenu.Root
export const DropdownMenuTrigger = BaseMenu.Trigger
export const DropdownMenuPortal = BaseMenu.Portal

type DropdownMenuContentProps = React.ComponentPropsWithoutRef<typeof BaseMenu.Popup> &
  Pick<React.ComponentPropsWithoutRef<typeof BaseMenu.Positioner>, 'align' | 'alignOffset' | 'side' | 'sideOffset'>

export const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof BaseMenu.Popup>, DropdownMenuContentProps>(
  ({ align = 'center', alignOffset, className, side = 'bottom', sideOffset = 8, ...props }, ref) => (
    <DropdownMenuPortal>
      <BaseMenu.Positioner align={align} alignOffset={alignOffset} className="z-50 outline-none" side={side} sideOffset={sideOffset}>
        <BaseMenu.Popup
          ref={ref}
          className={cn(
            'min-w-40 origin-(--transform-origin) rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none',
            'transition-[transform,scale,opacity] duration-100 ease-out',
            'data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0',
            className,
          )}
          {...props}
        />
      </BaseMenu.Positioner>
    </DropdownMenuPortal>
  ),
)
DropdownMenuContent.displayName = 'DropdownMenuContent'

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof BaseMenu.Item>,
  React.ComponentPropsWithoutRef<typeof BaseMenu.Item>
>(({ className, ...props }, ref) => (
  <BaseMenu.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
      'data-disabled:pointer-events-none data-disabled:opacity-50',
      'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
      className,
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = 'DropdownMenuItem'

export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof BaseMenu.Separator>,
  React.ComponentPropsWithoutRef<typeof BaseMenu.Separator>
>(({ className, ...props }, ref) => (
  <BaseMenu.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
))
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'
