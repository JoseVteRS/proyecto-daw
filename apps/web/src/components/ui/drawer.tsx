import { Dialog as BaseDialog } from '@base-ui-components/react/dialog'
import * as React from 'react'

import { cn } from '@/lib/utils'

type DrawerProps = React.ComponentPropsWithoutRef<typeof BaseDialog.Root>

type DrawerContextValue = {
  close: () => void
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null)

export function Drawer({ open: controlledOpen, defaultOpen = false, onOpenChange, ...props }: DrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = typeof controlledOpen === 'boolean'
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean, ...args: unknown[]) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen)
      }

      ;(onOpenChange as ((open: boolean, ...args: unknown[]) => void) | undefined)?.(nextOpen, ...args)
    },
    [isControlled, onOpenChange],
  )

  const contextValue = React.useMemo<DrawerContextValue>(
    () => ({
      close: () => handleOpenChange(false),
    }),
    [handleOpenChange],
  )

  return (
    <DrawerContext.Provider value={contextValue}>
      <BaseDialog.Root open={open} onOpenChange={handleOpenChange} {...props} />
    </DrawerContext.Provider>
  )
}

export const DrawerTrigger = BaseDialog.Trigger
export const DrawerClose = BaseDialog.Close
export const DrawerPortal = BaseDialog.Portal

export const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof BaseDialog.Backdrop>,
  React.ComponentPropsWithoutRef<typeof BaseDialog.Backdrop>
>(({ className, ...props }, ref) => (
  <BaseDialog.Backdrop
    ref={ref}
    className={cn(
      'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-nested:z-55',
      'data-starting-style:opacity-0 data-ending-style:opacity-0',
      'transition-opacity duration-200',
      className,
    )}
    {...props}
  />
))
DrawerOverlay.displayName = 'DrawerOverlay'

export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof BaseDialog.Popup>,
  React.ComponentPropsWithoutRef<typeof BaseDialog.Popup>
>(({ className, children, style, ...props }, ref) => {
  const context = React.useContext(DrawerContext)
  const [dragOffset, setDragOffset] = React.useState(0)
  const startYRef = React.useRef<number | null>(null)

  function resetDrag() {
    setDragOffset(0)
    startYRef.current = null
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse') {
      return
    }

    startYRef.current = event.clientY
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (startYRef.current === null) {
      return
    }

    const delta = event.clientY - startYRef.current
    setDragOffset(delta > 0 ? delta : 0)
  }

  function handlePointerEnd() {
    if (dragOffset > 72) {
      context?.close()
    }

    resetDrag()
  }

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <BaseDialog.Popup
        ref={ref}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-md flex-col data-nested:z-60',
          'rounded-t-2xl border-t border-border bg-background text-foreground shadow-xl',
          'max-h-[90dvh] overflow-hidden',
          'transition-transform duration-300 ease-out',
          'data-starting-style:translate-y-full data-ending-style:translate-y-full',
          'focus:outline-none',
          className,
        )}
        style={dragOffset > 0 ? { ...style, transform: `translateY(${dragOffset}px)`, transition: 'none' } : style}
        {...props}
      >
        <div
          className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-muted touch-none"
          aria-hidden
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={resetDrag}
        />
        {children}
      </BaseDialog.Popup>
    </DrawerPortal>
  )
})
DrawerContent.displayName = 'DrawerContent'

export function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 px-5 pt-4 pb-2 text-left', className)} {...props} />
}

export function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-2 px-5 pt-2 pb-5', className)} {...props} />
}

export const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof BaseDialog.Title>,
  React.ComponentPropsWithoutRef<typeof BaseDialog.Title>
>(({ className, ...props }, ref) => (
  <BaseDialog.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
DrawerTitle.displayName = 'DrawerTitle'

export const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof BaseDialog.Description>,
  React.ComponentPropsWithoutRef<typeof BaseDialog.Description>
>(({ className, ...props }, ref) => (
  <BaseDialog.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DrawerDescription.displayName = 'DrawerDescription'
